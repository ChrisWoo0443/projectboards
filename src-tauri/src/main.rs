use std::fs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct BoardData {
    boards: String, // Store boards as JSON string
}

#[tauri::command]
async fn save_boards(boards_json: String) -> Result<(), String> {
    let app_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app directory")?;
    
    // Create a custom subfolder
    let custom_dir = app_dir.join("project-boards");
    fs::create_dir_all(&custom_dir)
        .map_err(|e| e.to_string())?;
    
    let data_file = custom_dir.join("boards.json");
    fs::write(data_file, boards_json)
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn load_boards() -> Result<String, String> {
    let app_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app directory")?;
    
    let custom_dir = app_dir.join("project-boards");
    let data_file = custom_dir.join("boards.json");
    
    if !data_file.exists() {
        return Ok(String::from("[]"));
    }
    
    fs::read_to_string(data_file)
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_boards,
            load_boards
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
