import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #CC0000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#CC0000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 10,
  },
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
  },
  infoItem: {
    fontSize: 9,
    color: '#333333',
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: '#CC0000',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 30,
  },
  tableCol: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  col1: { width: '8%' },
  col2: { width: '15%' },
  col3: { width: '12%' },
  col4: { width: '20%' },
  col5: { width: '25%' },
  col6: { width: '20%' },
  textHeader: {
    fontWeight: 'bold',
    fontSize: 9,
  },
  textNormal: {
    fontSize: 8,
  },
  textSmall: {
    fontSize: 7,
    color: '#666666',
  },
  statusBadge: {
    padding: '2px 6px',
    borderRadius: 10,
    fontSize: 7,
    fontWeight: 'bold',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusResolved: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  statusProgress: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  statusArchived: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    borderTop: '1pt solid #E5E7EB',
    paddingTop: 10,
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#CC0000',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333333',
  },
  summaryValue: {
    fontSize: 8,
    color: '#666666',
  },
});

const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending':
      return styles.statusPending;
    case 'Resolved':
      return styles.statusResolved;
    case 'In Progress':
      return styles.statusProgress;
    case 'Archived':
      return styles.statusArchived;
    default:
      return styles.statusPending;
  }
};

const ReportsPDF = ({ reports, filters = {} }) => {
  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const currentTime = new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate summary statistics
  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
  const progressCount = reports.filter(r => r.status === 'In Progress').length;
  const archivedCount = reports.filter(r => r.status === 'Archived').length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ACTIVITY LOGS REPORT</Text>
          <Text style={styles.subtitle}>System Activity and User Actions</Text>
        </View>

        {/* Report Information */}
        <View style={styles.reportInfo}>
          <Text style={styles.infoItem}>Generated on: {currentDate} at {currentTime}</Text>
          <Text style={styles.infoItem}>Total Records: {reports.length}</Text>
          {filters.startDate && (
            <Text style={styles.infoItem}>
              Date Range: {formatDate(filters.startDate)} - {filters.endDate ? formatDate(filters.endDate) : 'Present'}
            </Text>
          )}
        </View>

        {/* Summary Statistics */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>SUMMARY STATISTICS</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Reports:</Text>
              <Text style={styles.summaryValue}>{totalReports}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pending:</Text>
              <Text style={styles.summaryValue}>{pendingCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>In Progress:</Text>
              <Text style={styles.summaryValue}>{progressCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Resolved:</Text>
              <Text style={styles.summaryValue}>{resolvedCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Archived:</Text>
              <Text style={styles.summaryValue}>{archivedCount}</Text>
            </View>
          </View>
        </View>

        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, styles.col1]}><Text style={styles.textHeader}>#</Text></View>
          <View style={[styles.tableCol, styles.col2]}><Text style={styles.textHeader}>USER</Text></View>
          <View style={[styles.tableCol, styles.col3]}><Text style={styles.textHeader}>ID NUMBER</Text></View>
          <View style={[styles.tableCol, styles.col4]}><Text style={styles.textHeader}>ACTION</Text></View>
          <View style={[styles.tableCol, styles.col5]}><Text style={styles.textHeader}>DETAILS</Text></View>
          <View style={[styles.tableCol, styles.col6]}><Text style={styles.textHeader}>DATE & TIME</Text></View>
        </View>

        {/* Table Rows */}
        {reports.map((log, index) => (
          <View style={styles.tableRow} key={log._id || index}>
            <View style={[styles.tableCol, styles.col1]}>
              <Text style={styles.textNormal}>{index + 1}</Text>
            </View>
            <View style={[styles.tableCol, styles.col2]}>
              <Text style={styles.textNormal}>{log.userName || "System"}</Text>
            </View>
            <View style={[styles.tableCol, styles.col3]}>
              <Text style={styles.textSmall}>{log.id_number || "—"}</Text>
            </View>
            <View style={[styles.tableCol, styles.col4]}>
              <Text style={styles.textNormal}>{log.action}</Text>
            </View>
            <View style={[styles.tableCol, styles.col5]}>
              <Text style={styles.textSmall}>{log.details || "No details provided"}</Text>
            </View>
            <View style={[styles.tableCol, styles.col6]}>
              <Text style={styles.textSmall}>{formatDateTime(log.createdAt)}</Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was generated automatically from the Activity Logs System</Text>
          <Text>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportsPDF;