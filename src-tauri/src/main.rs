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
    
    let custom_dir = app_dir.join("project-boards");
    
    // Create the directory if it doesn't exist
    if !custom_dir.exists() {
        fs::create_dir_all(&custom_dir)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    // Validate JSON before saving
    serde_json::from_str::<serde_json::Value>(&boards_json)
        .map_err(|e| format!("Invalid JSON data: {}", e))?;
    
    let data_file = custom_dir.join("boards.json");
    let temp_file = custom_dir.join("boards.json.tmp");
    
    // Write to temporary file first (atomic write)
    fs::write(&temp_file, &boards_json)
        .map_err(|e| format!("Failed to write temporary file: {}", e))?;
    
    // Verify the temporary file was written correctly
    let written_content = fs::read_to_string(&temp_file)
        .map_err(|e| format!("Failed to verify temporary file: {}", e))?;
    
    if written_content != boards_json {
        let _ = fs::remove_file(&temp_file); // Clean up
        return Err("Data verification failed after write".to_string());
    }
    
    // Atomically replace the original file
    fs::rename(&temp_file, &data_file)
        .map_err(|e| {
            let _ = fs::remove_file(&temp_file); // Clean up on failure
            format!("Failed to replace file: {}", e)
        })?;
    
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
    
    // Read the file content
    let content = fs::read_to_string(&data_file)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    // Validate that the content is valid JSON
    match serde_json::from_str::<serde_json::Value>(&content) {
        Ok(_) => Ok(content),
        Err(e) => {
            // If JSON is invalid, create a backup and return empty array
            let backup_file = custom_dir.join(format!("boards_corrupted_{}.json", 
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs()));
            
            // Try to backup the corrupted file
            let _ = fs::copy(&data_file, &backup_file);
            
            eprintln!("Corrupted JSON detected: {}. Backup created at: {:?}", e, backup_file);
            Ok(String::from("[]"))
        }
    }
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
