use napi::threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode};
use napi::JsFunction;

use windows::core::PCWSTR;
use windows::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::System::Shutdown::{ShutdownBlockReasonCreate, ShutdownBlockReasonDestroy};
use windows::Win32::System::Threading::SetProcessShutdownParameters;
use windows::Win32::UI::WindowsAndMessaging::{CallWindowProcW, SetWindowLongPtrW, WNDPROC};
use windows::Win32::UI::WindowsAndMessaging::{GWLP_WNDPROC, WM_ENDSESSION, WM_QUERYENDSESSION};

pub static mut MAIN_WINDOW: HWND = HWND(0);
pub static mut PREV_WND_PROC: WNDPROC = None;
pub static mut SHOULD_BLOCK_SHUTDOWN: bool = false;
pub static mut FN: Option<ThreadsafeFunction<i64>> = None;

/// Low api implement windows 'shutdown' event for electron
/// ref: https://github.com/paymoapp/electron-shutdown-handler/blob/master/module/WinShutdownHandler.cpp

pub unsafe fn set_main_window_handle(h_wnd: HWND) {
  MAIN_WINDOW = h_wnd;

  SetProcessShutdownParameters(0x3FF, 0);
}

pub unsafe fn insert_wnd_proc_hook(callback: JsFunction) -> bool {
  if let Ok(func) = callback.create_threadsafe_function(0, |ctx| {
    ctx.env.create_int64(ctx.value + 1).map(|v| vec![v])
  }) {
    FN = Some(func)
  }

  if MAIN_WINDOW.eq(&HWND::default()) {
    return false;
  }

  if PREV_WND_PROC.is_some() {
    return false;
  }

  PREV_WND_PROC = Some(std::mem::transmute(SetWindowLongPtrW(
    MAIN_WINDOW,
    GWLP_WNDPROC,
    window_proc as _,
  )));

  true
}

pub unsafe fn remove_wnd_proc_hook() -> bool {
  if MAIN_WINDOW.eq(&HWND::default()) {
    return false;
  }

  if let Some(proc) = PREV_WND_PROC {
    FN = None;
    SetWindowLongPtrW(MAIN_WINDOW, GWLP_WNDPROC, proc as _);
  }

  true
}

pub unsafe fn acquire_shutdown_block(reason: &str) -> bool {
  if MAIN_WINDOW.eq(&HWND::default()) {
    return false;
  }

  let mut _reason: Vec<u16> = reason.encode_utf16().collect();
  _reason.push(0);
  ShutdownBlockReasonCreate(MAIN_WINDOW, PCWSTR(_reason.as_ptr()));
  SHOULD_BLOCK_SHUTDOWN = true;

  true
}

pub unsafe fn release_shutdown_block() -> bool {
  if MAIN_WINDOW.eq(&HWND::default()) {
    return false;
  }

  let result = ShutdownBlockReasonDestroy(MAIN_WINDOW);
  SHOULD_BLOCK_SHUTDOWN = false;

  result.is_ok()
}

unsafe extern "system" fn window_proc(
  h_wnd: HWND,
  event: u32,
  w_param: WPARAM,
  l_param: LPARAM,
) -> LRESULT {
  if event == WM_QUERYENDSESSION {
    if let Some(func) = FN.as_ref() {
      func.call(Ok(l_param.0 as _), ThreadsafeFunctionCallMode::Blocking);
    }

    if SHOULD_BLOCK_SHUTDOWN {
      return LRESULT(0);
    }

    return LRESULT(1);
  } else if event == WM_ENDSESSION && w_param.0 == 0 {
    return LRESULT(0);
  }

  CallWindowProcW(PREV_WND_PROC, h_wnd, event, w_param, l_param)
}
