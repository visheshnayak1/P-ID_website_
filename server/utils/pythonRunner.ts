import { spawn } from "child_process";
import path from "path";
import fs from "fs";

interface DetectionOptions {
  confidenceThreshold: number;
  iouThreshold: number;
}

/**
 * Runs the Python detection script on the provided image
 * @param imagePath Path to the image file
 * @param options Detection options
 * @returns Promise with detection results
 */
export async function runPythonDetection(
  imagePath: string,
  options: DetectionOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    // Ensure the input file exists
    if (!fs.existsSync(imagePath)) {
      return reject(new Error(`Input file does not exist: ${imagePath}`));
    }

    // Path to the Python script
    const scriptPath = path.join(process.cwd(), "server", "scripts", "detect.py");
    
    // Ensure the script exists
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Detection script not found at: ${scriptPath}`));
    }

    // Results directory
    const resultsDir = path.join(process.cwd(), "results");
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Generate unique output name
    const outputName = `result_${Date.now()}.jpg`;
    const outputPath = path.join(resultsDir, outputName);

    // Set up the Python process
    const pythonProcess = spawn("python", [
      scriptPath,
      "--image", imagePath,
      "--output", outputPath,
      "--conf-thres", options.confidenceThreshold.toString(),
      "--iou-thres", options.iouThreshold.toString()
    ]);

    let resultData = "";
    let errorData = "";

    // Collect data from the Python script
    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Error output: ${errorData}`);
        return reject(new Error(`Detection failed: ${errorData}`));
      }

      try {
        // Parse the JSON output from the script
        const result = JSON.parse(resultData);
        resolve(result);
      } catch (error) {
        console.error("Failed to parse Python output:", resultData);
        reject(new Error("Failed to parse detection results"));
      }
    });
  });
}
