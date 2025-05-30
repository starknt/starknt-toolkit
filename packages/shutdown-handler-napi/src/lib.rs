#![allow(unused)]
#![allow(non_snake_case)]

mod platform_impl;

#[cfg(target_os = "windows")]
mod windows {
  use crate::platform_impl::power;
  use napi::{JsBuffer, JsFunction};
  use napi_derive::napi;

  #[napi]
  pub fn set_main_window_handle(buf: JsBuffer) {
    unsafe {
      if let Ok(n) = buf.coerce_to_number() {
        if let Ok(h_wnd) = n.get_int64() {
          power::set_main_window_handle(windows::Win32::Foundation::HWND(h_wnd as isize));
        }
      }
    }
  }

  #[napi]
  pub fn insert_wnd_proc_hook(callback: JsFunction) {
    unsafe {
      power::insert_wnd_proc_hook(callback);
    }
  }

  #[napi]
  pub fn remove_wnd_proc_hook() -> bool {
    unsafe { power::remove_wnd_proc_hook() }
  }

  #[napi]
  pub fn acquire_shutdown_block(reason: String) -> bool {
    unsafe { power::acquire_shutdown_block(reason.as_str()) }
  }

  #[napi]
  pub fn release_shutdown_block() -> bool {
    unsafe { power::release_shutdown_block() }
  }
}

#[cfg(target_os = "linux")]
mod linux {
  use napi::{JsBuffer, JsFunction};
  use napi_derive::napi;

  #[napi]
  pub fn set_main_window_handle(bigint: JsBuffer) {}

  #[napi]
  pub fn insert_wnd_proc_hook(callback: JsFunction) {}

  #[napi]
  pub fn remove_wnd_proc_hook() -> bool {
    true
  }

  #[napi]
  pub fn acquire_shutdown_block(reason: String) -> bool {
    true
  }

  #[napi]
  pub fn release_shutdown_block() -> bool {
    true
  }
}

#[cfg(target_os = "macos")]
mod macos {
  use napi::{JsBuffer, JsFunction};
  use napi_derive::napi;

  #[napi]
  pub fn set_main_window_handle(bigint: JsBuffer) {}

  #[napi]
  pub fn insert_wnd_proc_hook(callback: JsFunction) {}

  #[napi]
  pub fn remove_wnd_proc_hook() -> bool {
    true
  }

  #[napi]
  pub fn acquire_shutdown_block(reason: String) -> bool {
    true
  }

  #[napi]
  pub fn release_shutdown_block() -> bool {
    true
  }
}
