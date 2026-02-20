<?php
header('Content-Type: application/json');

// 1. FIND YOUR PYTHON PATH: Type 'where python' in CMD and paste the result here
$pythonPath = 'C:/Users/Administrator/AppData/Local/Programs/Python/Python313/python.exe'; 
$scriptPath = 'H:/xampp/htdocs/dev/job-scraper/scraper/scraper.py';

// 2. Change directory to the scraper folder so .env is found
chdir('H:/xampp/htdocs/dev/job-scraper/scraper');

putenv('PYTHONIOENCODING=utf-8');

// 3. Execute with absolute paths
$command = "\"$pythonPath\" \"$scriptPath\" 2>&1";
exec($command, $output, $return_var);

if ($return_var === 0) {
    echo json_encode(["status" => "success"]);
} else {
    // This will now send the EXACT error back to your JS console
    echo json_encode([
        "status" => "error", 
        "details" => $output,
        "debug_command" => $command
    ]);
}
?>