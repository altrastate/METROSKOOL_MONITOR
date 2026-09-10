//! Metroskool Monitor Windows shell.
//!
//! Loads teaching `/monitor` only. Privileged cloud keys must never be present
//! in this process.

use metroskool_desktop_core::{DeviceMetadata, DevicePlatform};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use url::Url;

pub fn is_monitor_url(href: &str) -> bool {
    let Ok(url) = Url::parse(href) else {
        return false;
    };
    let path = url.path();
    path == "/monitor" || path.starts_with("/monitor/")
}

pub fn allow_monitor_webview_navigation(href: &str) -> bool {
    let Ok(url) = Url::parse(href) else {
        return false;
    };
    let path = url.path();
    path == "/monitor"
        || path.starts_with("/monitor/")
        || path == "/"
        || path.starts_with("/_next")
        || path.starts_with("/brand")
        || path == "/favicon.ico"
}

pub fn refuse_privileged_env() -> Result<(), String> {
    for (key, value) in std::env::vars() {
        if value.is_empty() {
            continue;
        }
        let upper = key.to_ascii_uppercase();
        if upper.contains("SERVICE_ROLE")
            || upper.contains("RESEND_API")
            || upper.contains("VOTE_INTEGRITY")
        {
            return Err(
                "Refusing to start: privileged keys must not be in the Monitor desktop process."
                    .into(),
            );
        }
    }
    Ok(())
}

#[tauri::command]
fn open_monitor_window(app: tauri::AppHandle, url: String) -> Result<(), String> {
    refuse_privileged_env()?;
    if !is_monitor_url(&url) {
        return Err("Windows Monitor only opens /monitor.".into());
    }
    let parsed = Url::parse(&url).map_err(|err| err.to_string())?;
    if let Some(existing) = app.get_webview_window("monitor-workspace") {
        existing
            .navigate(parsed.clone())
            .map_err(|err| err.to_string())?;
        let _ = existing.set_focus();
        return Ok(());
    }
    let builder = WebviewWindowBuilder::new(&app, "monitor-workspace", WebviewUrl::External(parsed))
        .title("Metroskool Monitor")
        .inner_size(1280.0, 840.0)
        .on_navigation(|nav| allow_monitor_webview_navigation(nav.as_str()));
    builder.build().map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
fn device_metadata() -> Result<DeviceMetadata, String> {
    let meta = DeviceMetadata {
        platform: DevicePlatform::Windows,
        app_id: "metroskool-monitor-desktop".into(),
        app_version: env!("CARGO_PKG_VERSION").into(),
        device_name: None,
    };
    meta.validate().map_err(|err| err.to_string())?;
    Ok(meta)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(err) = refuse_privileged_env() {
        eprintln!("{err}");
        std::process::exit(1);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_monitor_window, device_metadata])
        .run(tauri::generate_context!())
        .expect("error while running Metroskool Monitor");
}

#[cfg(test)]
mod tests {
    use super::{allow_monitor_webview_navigation, is_monitor_url, refuse_privileged_env};

    #[test]
    fn monitor_paths_only() {
        assert!(is_monitor_url("http://localhost:3004/monitor"));
        assert!(is_monitor_url(
            "http://localhost:3004/monitor/registers"
        ));
        assert!(!is_monitor_url("http://localhost:3004/"));
        assert!(!is_monitor_url("http://localhost:3001/admin"));
        assert!(allow_monitor_webview_navigation(
            "http://localhost:3004/_next/static/chunk.js"
        ));
        assert!(!allow_monitor_webview_navigation(
            "http://localhost:3001/admin"
        ));
    }

    #[test]
    fn privileged_env_rejected() {
        // SAFETY: test process only.
        unsafe {
            std::env::set_var("SUPABASE_SERVICE_ROLE_KEY", "nope");
        }
        let result = refuse_privileged_env();
        unsafe {
            std::env::remove_var("SUPABASE_SERVICE_ROLE_KEY");
        }
        assert!(result.is_err());
    }
}
