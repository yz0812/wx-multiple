use std::{
    collections::HashSet,
    env,
    path::{Path, PathBuf},
    process::Command,
    thread,
    time::Duration,
};

#[tauri::command]
fn scan_weixin_path() -> Option<String> {
    find_weixin_executable()
        .and_then(|path| path.parent().map(Path::to_path_buf))
        .map(|path| path.to_string_lossy().to_string())
}

#[tauri::command]
fn launch_weixin_instances(directory: String, count: u32) -> Result<String, String> {
    if !cfg!(target_os = "windows") {
        return Err("当前仅支持 Windows 系统。".into());
    }

    if !(1..=10).contains(&count) {
        return Err("启动数量必须在 1 到 10 之间。".into());
    }

    let executable = resolve_weixin_executable(&directory)?;

    for index in 0..count {
        Command::new(&executable)
            .spawn()
            .map_err(|error| format!("启动微信失败：{error}"))?;

        if index + 1 < count {
            thread::sleep(Duration::from_millis(500));
        }
    }

    Ok(format!("已启动微信 {count} 个实例。"))
}

fn resolve_weixin_executable(input: &str) -> Result<PathBuf, String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Err("微信目录不能为空。".into());
    }

    let path = PathBuf::from(trimmed);
    let executable = if path
        .file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name.eq_ignore_ascii_case("Weixin.exe"))
    {
        path
    } else {
        path.join("Weixin.exe")
    };

    if !executable.exists() {
        return Err(format!("未找到微信可执行文件：{}", executable.display()));
    }

    Ok(executable)
}

fn find_weixin_executable() -> Option<PathBuf> {
    collect_candidate_paths()
        .into_iter()
        .find(|candidate| candidate.exists())
}

fn collect_candidate_paths() -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    for key in ["PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"] {
        if let Some(base) = env::var_os(key) {
            candidates.push(PathBuf::from(base).join("Tencent").join("Weixin").join("Weixin.exe"));
        }
    }

    for letter in 'C'..='Z' {
        let drive = format!("{letter}:\\");
        let drive_root = PathBuf::from(&drive);

        if !drive_root.exists() {
            continue;
        }

        candidates.push(
            drive_root
                .join("Program Files")
                .join("Tencent")
                .join("Weixin")
                .join("Weixin.exe"),
        );
        candidates.push(
            drive_root
                .join("Program Files (x86)")
                .join("Tencent")
                .join("Weixin")
                .join("Weixin.exe"),
        );
    }

    let mut seen = HashSet::new();
    candidates
        .into_iter()
        .filter(|path| seen.insert(path.clone()))
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![scan_weixin_path, launch_weixin_instances])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
