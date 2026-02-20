<?php
header('Content-Type: application/json');

// Use forward slashes for reliability
$pythonPath = 'C:/Users/Administrator/AppData/Local/Programs/Python/Python313/python.exe'; 
$scriptPath = 'H:/xampp/htdocs/dev/job-scraper/scraper/scraper.py';

chdir('H:/xampp/htdocs/dev/job-scraper/scraper');
putenv('PYTHONIOENCODING=utf-8');

$query = isset($_GET['query']) ? escapeshellarg($_GET['query']) : '"Junior Developer"';
$location = isset($_GET['location']) ? escapeshellarg($_GET['location']) : '"United Kingdom"';

// Combine the command into a single clean string
$command = "$pythonPath $scriptPath $query $location 2>&1";
exec($command, $output, $return_var);

if ($return_var === 0) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode([
        "status" => "error", 
        "details" => $output,
        "debug_command" => $command
    ]);
}
?>