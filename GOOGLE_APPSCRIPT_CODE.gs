// Google Apps Script for UNIHUB Resources Google Sheets Integration
// This script receives resource data from your Next.js app and saves it to Google Sheets

/**
 * Configuration
 * Update this with your Google Sheet ID
 */
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE', // Replace with your Google Sheet ID
  SHEET_NAME: 'Resources',
  HEADERS: ['ID', 'Timestamp', 'Year', 'Semester', 'Module', 'Resource Name', 'Type', 'Shareable Link', 'Description', 'Uploader ID', 'Uploader Name', 'Created At'],
};

/**
 * Main doPost function - Called when data is sent from your Next.js app
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('📥 Received data:', data);

    if (data.action === 'addResource') {
      const result = addResourceToSheet(data.resource);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Resource added to Google Sheet',
        result: result,
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Unknown action',
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('❌ Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Add a resource to the Google Sheet
 */
function addResourceToSheet(resource) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log('Creating new sheet:', CONFIG.SHEET_NAME);
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      sheet.appendRow(CONFIG.HEADERS);
    }

    // Validate required fields
    if (!resource.id || !resource.name) {
      throw new Error('Missing required fields: id, name');
    }

    // Prepare row data
    const rowData = [
      resource.id,
      resource.timestamp || new Date().toLocaleString(),
      resource.year || '',
      resource.semester || '',
      resource.module_name || '',
      resource.name || '',
      resource.resource_type || '',
      resource.shareable_link || '',
      resource.description || '',
      resource.uploader_id || '',
      resource.uploader_name || 'Anonymous',
      resource.created_at || '',
    ];

    // Append row to sheet
    sheet.appendRow(rowData);

    console.log('✅ Resource added to Google Sheet:', {
      id: resource.id,
      name: resource.name,
      row: sheet.getLastRow(),
    });

    return {
      row: sheet.getLastRow(),
      resourceId: resource.id,
      resourceName: resource.name,
    };

  } catch (error) {
    console.error('❌ Error adding resource to sheet:', error);
    throw error;
  }
}

/**
 * Initialize the Google Sheet with headers (Run this once manually)
 * To use: Go to Apps Script editor > Run > initializeSheet
 */
function initializeSheet() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      console.log('Creating sheet:', CONFIG.SHEET_NAME);
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    }

    // Clear existing data
    if (sheet.getLastRow() > 0) {
      sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
    }

    // Add headers
    sheet.appendRow(CONFIG.HEADERS);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');

    // Set column widths
    const widths = [80, 150, 80, 100, 150, 200, 100, 250, 200, 150, 150, 150];
    for (let i = 0; i < widths.length; i++) {
      sheet.setColumnWidth(i + 1, widths[i]);
    }

    // Freeze header row
    sheet.setFrozenRows(1);

    console.log('✅ Sheet initialized successfully');
    SpreadsheetApp.getUi().alert('Sheet initialized successfully!');

  } catch (error) {
    console.error('❌ Error initializing sheet:', error);
    SpreadsheetApp.getUi().alert('Error initializing sheet: ' + error.toString());
  }
}

/**
 * Test function - Run this to verify the AppScript deployment is working
 * To use: Go to Apps Script editor > Run > testAppScript
 */
function testAppScript() {
  try {
    const testResource = {
      action: 'addResource',
      resource: {
        id: 999,
        timestamp: new Date().toLocaleString(),
        year: 'Year 1',
        semester: 'Semester 1',
        module_name: 'Test Module',
        name: 'Test Resource',
        resource_type: 'PDF',
        shareable_link: 'https://example.com/test.pdf',
        description: 'This is a test resource',
        uploader_id: 'test-user-123',
        uploader_name: 'Test User',
        created_at: new Date().toISOString(),
      },
    };

    const result = addResourceToSheet(testResource.resource);
    console.log('✅ Test successful:', result);
    SpreadsheetApp.getUi().alert('Test successful! Check the Google Sheet.\n\nResources are being added to row: ' + result.row);

  } catch (error) {
    console.error('❌ Test failed:', error);
    SpreadsheetApp.getUi().alert('Test failed: ' + error.toString());
  }
}

/**
 * Get statistics from the Google Sheet
 */
function getStats() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      return { error: 'Sheet not found' };
    }

    const data = sheet.getDataRange().getValues();
    const rowCount = sheet.getLastRow();
    const resourceCount = rowCount - 1; // Exclude header

    const typeStats = {};
    const uploaderStats = {};

    // Analyze data (skip header row)
    for (let i = 1; i < data.length; i++) {
      const type = data[i][6]; // Resource Type column
      const uploader = data[i][10]; // Uploader Name column

      typeStats[type] = (typeStats[type] || 0) + 1;
      uploaderStats[uploader] = (uploaderStats[uploader] || 0) + 1;
    }

    console.log('📊 Statistics:', {
      totalResources: resourceCount,
      byType: typeStats,
      byUploader: uploaderStats,
    });

    return {
      totalResources: resourceCount,
      byType: typeStats,
      byUploader: uploaderStats,
    };

  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return { error: error.toString() };
  }
}

/**
 * Clear all data from the sheet (keeping headers)
 * WARNING: This will delete all resources from the sheet!
 */
function clearAllData() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) return;

    // Keep only the header row
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }

    console.log('✅ All data cleared');
    SpreadsheetApp.getUi().alert('All data cleared! Only headers remain.');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    SpreadsheetApp.getUi().alert('Error clearing data: ' + error.toString());
  }
}

/**
 * Deploy as web app callback
 * This is required for the deployment to work
 */
function doGet(e) {
  return ContentService.createTextOutput('Google Apps Script deployed successfully!')
    .setMimeType(ContentService.MimeType.TEXT);
}
