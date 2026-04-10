<?php

class PDFTextExtractor
{
    /**
     * Extract text from a PDF file.
     *
     * This implementation calls a Java CLI tool built using Apache PDFBox.
     * The Java program should be packaged as "pdf-extractor.jar".
     *
     * Command executed:
     * java -jar pdf-extractor.jar <pdf_file_path>
     *
     * The Java tool prints extracted text to stdout which is captured here.
     */

    // Java executable path — must be outside the function
    private $javaPath = 'C:\\Program Files\\Java\\jdk-24\\bin\\java.exe';

    public function extractFromPath(string $filePath): string
    {
        // Basic validation
        if (!file_exists($filePath)) {
            throw new RuntimeException('PDF file not found: ' . $filePath);
        }

        // Absolute path to jar (one level up from utils/)
        $jarPath = __DIR__ . '/../pdf-extractor.jar';

       if (!file_exists($jarPath)) {
    throw new RuntimeException('pdf-extractor.jar not found at: ' . $jarPath);
}

// Add this block:
$pdfboxPath = __DIR__ . '/../pdfbox-app-3.0.7.jar';
if (!file_exists($pdfboxPath)) {
    throw new RuntimeException('pdfbox-app-3.0.7.jar not found at: ' . $pdfboxPath);
}

        // Escape all paths for security
        $safeJava = escapeshellarg($this->javaPath);
        $safeJar  = escapeshellarg($jarPath);
        $safePdf  = escapeshellarg($filePath);

        // Build and execute command
        $pdfboxPath = __DIR__ . '/../pdfbox-app-3.0.7.jar';
$safePdfbox = escapeshellarg($pdfboxPath);
$command    = "$safeJava -cp $safePdfbox;$safeJar PDFExtractor $safePdf 2>&1";
        $output  = shell_exec($command);

        
        // Validate extraction result
        if ($output === null) {
            throw new RuntimeException('shell_exec failed — check disable_functions in php.ini');
        }

        // Clean the extracted text
        $text = trim($output);

        if ($text === '') {
            throw new RuntimeException('No text could be extracted from the PDF.');
        }

        // Catch Java stack traces returned as output
        // Only fail on actual fatal Java errors
if (stripos($text, 'Exception in thread') !== false
    || stripos($text, 'NoClassDefFoundError') !== false
    || stripos($text, 'ClassNotFoundException') !== false
    || stripos($text, 'UnsupportedClassVersionError') !== false) {
    throw new RuntimeException('Java fatal error: ' . $text);
}

return $text;
    }
}