import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportTransactionsToExcel = (transactions: any[], fileName: string = 'المحاسب_الذكي_عمليات') => {
  // Format data for Excel
  const data = transactions.map(tx => {
    let dateStr = '';
    try {
      if (tx.date && tx.date.seconds) {
        dateStr = format(new Date(tx.date.seconds * 1000), 'd/M/yyyy HH:mm');
      } else if (tx.date instanceof Date) {
        dateStr = format(tx.date, 'd/M/yyyy HH:mm');
      }
    } catch (e) {
      dateStr = 'تاريخ غير صالح';
    }

    return {
      'التاريخ': dateStr,
      'البيان': tx.description || '-',
      'الجهة/الشخص': tx.personName || '-',
      'الفئة': tx.category,
      'المبلغ': tx.amount,
      'النوع': tx.type === 'income' ? 'إيراد' : tx.type === 'expense' ? 'مصروف' : 'عهدة'
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns (rough estimate based on header length)
  const wscols = [
    { wch: 20 }, // التاريخ
    { wch: 40 }, // البيان
    { wch: 25 }, // الجهة/الشخص
    { wch: 20 }, // الفئة
    { wch: 15 }, // المبلغ
    { wch: 15 }  // النوع
  ];
  worksheet['!cols'] = wscols;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'العمليات');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
