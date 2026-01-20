/**
 * Export utilities for CSV and JSON data export
 */

/**
 * Format a value for CSV output
 * Handles special characters, quotes, and null values
 */
export function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Check if value contains special characters that require quoting
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Escape double quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const headerRow = headers.join(',');

  // Create CSV data rows
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      // Handle nested objects by converting to JSON
      if (typeof value === 'object' && value !== null) {
        return formatCSVValue(JSON.stringify(value));
      }
      return formatCSVValue(value);
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Download a file with given content, filename, and MIME type
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  // Create a Blob from the content
  const blob = new Blob([content], { type: mimeType });

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCSV(data: any[], filename?: string): void {
  const csvContent = convertToCSV(data);
  const defaultFilename = `export_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, filename || defaultFilename, 'text/csv');
}

/**
 * Export data to JSON file
 */
export function exportToJSON(data: any, filename?: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const defaultFilename = `export_${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(jsonContent, filename || defaultFilename, 'application/json');
}
