#![deny(clippy::all)]
#[macro_use]
extern crate napi_derive;

/// Get/Set system proxy. Supports Windows, macOS and linux (via gsettings).

#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

// #[cfg(feature = "utils")]
pub mod utils;

#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct Sysproxy {
  pub enable: bool,
  pub host: String,
  pub port: Option<u16>,
  pub bypass: String,
}

#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct Autoproxy {
  pub enable: bool,
  pub url: String,
}

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("failed to parse string `{0}`")]
  ParseStr(String),

  #[error(transparent)]
  Io(#[from] std::io::Error),

  #[error("failed to get default network interface")]
  NetworkInterface,

  #[error("failed to set proxy for this environment")]
  NotSupport,

  #[cfg(target_os = "linux")]
  #[error(transparent)]
  Xdg(#[from] xdg::BaseDirectoriesError),

  #[cfg(target_os = "windows")]
  #[error("system call failed")]
  SystemCall(#[from] windows::Win32Error),
}

pub type Result<T> = std::result::Result<T, Error>;

impl Sysproxy {
  pub fn is_support() -> bool {
    cfg!(any(
      target_os = "linux",
      target_os = "macos",
      target_os = "windows",
    ))
  }
}

impl Autoproxy {
  pub fn is_support() -> bool {
    cfg!(any(
      target_os = "linux",
      target_os = "macos",
      target_os = "windows",
    ))
  }
}

#[napi]
pub fn trigger_manual_proxy(
  enable: bool,
  host: String,
  port: u16,
  bypass: String,
) -> std::result::Result<(), napi::Error> {
  let sys = Sysproxy {
    enable,
    host,
    port: Some(port),
    bypass,
  };
  match sys.set_system_proxy() {
    Ok(_) => Ok(()),
    Err(e) => Err(napi::Error::new(
      napi::Status::GenericFailure,
      e.to_string(),
    )),
  }
}

#[napi]
pub fn trigger_manual_proxy_by_url(
  enable: bool,
  url: String,
  bypass: String,
) -> std::result::Result<(), napi::Error> {
  let sys = Sysproxy {
    enable,
    host: url,
    port: None,
    bypass,
  };
  match sys.set_system_proxy() {
    Ok(_) => Ok(()),
    Err(e) => Err(napi::Error::new(
      napi::Status::GenericFailure,
      e.to_string(),
    )),
  }
}

#[napi]
pub fn trigger_auto_proxy(enable: bool, url: String) -> std::result::Result<(), napi::Error> {
  let auto = Autoproxy { enable, url };
  match auto.set_auto_proxy() {
    Ok(_) => Ok(()),
    Err(e) => Err(napi::Error::new(
      napi::Status::GenericFailure,
      e.to_string(),
    )),
  }
}
