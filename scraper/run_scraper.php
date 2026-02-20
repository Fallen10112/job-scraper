<?php
header('Content-Type: application/json');

// 1. Double check this path! Type 'where python' in CMD to be 100% sure.
$pythonPath = 'C:/Users/Administrator/AppData/Local/Programs/Python/Python313/python.exe'; 
$scriptPath = 'H:/xampp/htdocs/dev/job-scraper/scraper/scraper.py';

// 2. We must tell the server exactly where to stand before running the script
chdir('H:/xampp/htdocs/dev/job-scraper/scraper');

// 3. This captures the "Hidden" error messages Python sends out
$command = "\"$pythonPath\" \"$scriptPath\" 2>&1";
exec($command, $output, $return_var);

if ($return_var === 0) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode([
        "status" => "error", 
        "details" => $output, // This will now show the REAL error in your console
        "debug_command" => $command
    ]);
}
?>