import { BookForestEntry } from '../types';

/**
 * Downloads the entire BookForest library as a formatted JSON backup file.
 */
export function exportBookForestJSON(entries: BookForestEntry[]) {
  const dataStr = JSON.stringify(entries, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BookForest_Library_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the entire BookForest library as a CSV file for spreadsheet analysis.
 */
export function exportBookForestCSV(entries: BookForestEntry[]) {
  const headers = [
    'ID',
    'Title',
    'Author',
    'Genre',
    'Reading Status',
    'User Rating',
    'Current Pages',
    'Total Pages',
    'Owned Formats',
    'Collection Location',
    'Edition Details',
    'Purchase Price ($)',
    'Date Added',
    'Date Started',
    'Date Finished',
    'Review Comments',
    'Quotes Saved',
    'Tags',
    'Loaned Out',
    'Borrower Name',
    'Borrower Contact',
    'Loan Date',
    'Due Date',
    'Plot Twist Rating',
    'Pacing & Tone',
    'Would Re-read',
    'Emotional Impact',
  ];

  const escapeCSV = (val: any): string => {
    if (val === undefined || val === null) return '""';
    let str = Array.isArray(val) ? val.join('; ') : String(val);
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = entries.map((e) => [
    escapeCSV(e.id),
    escapeCSV(e.title),
    escapeCSV(e.author),
    escapeCSV(e.genre),
    escapeCSV(e.readingStatus),
    escapeCSV(e.userRating),
    escapeCSV(e.currentProgressPages ?? 0),
    escapeCSV(e.totalPages ?? 0),
    escapeCSV(e.ownedFormats),
    escapeCSV(e.collectionLocation),
    escapeCSV(e.editionDetails ?? ''),
    escapeCSV(e.purchasePrice ?? 0),
    escapeCSV(e.dateAdded),
    escapeCSV(e.dateStarted ?? ''),
    escapeCSV(e.dateFinished ?? ''),
    escapeCSV(e.reviewComments),
    escapeCSV(e.quotesSaved),
    escapeCSV(e.tags),
    escapeCSV(e.loan?.isLoanedOut ? 'Yes' : 'No'),
    escapeCSV(e.loan?.borrowerName ?? ''),
    escapeCSV(e.loan?.borrowerContact ?? ''),
    escapeCSV(e.loan?.loanDate ?? ''),
    escapeCSV(e.loan?.dueDate ?? ''),
    escapeCSV(e.journalPrompts?.plotTwistRating ?? ''),
    escapeCSV(e.journalPrompts?.pacingAndTone ?? ''),
    escapeCSV(e.journalPrompts?.wouldReRead ?? ''),
    escapeCSV(e.journalPrompts?.emotionalImpact ?? ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BookForest_Library_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
