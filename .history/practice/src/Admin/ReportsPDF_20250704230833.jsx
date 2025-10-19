import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#CC0000',
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { 
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F3F4F6',
    padding: 5,
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  textHeader: {
    fontWeight: 'bold',
  },
});

const ReportsPDF = ({ reports }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>System Reports</Text>
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.textHeader}>#</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.textHeader}>Reported By</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.textHeader}>Category</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.textHeader}>Details</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.textHeader}>Reported On</Text></View>
        </View>
        
        {/* Data Rows */}
        {reports.map((rep, index) => (
          <View style={styles.tableRow} key={rep._id}>
            <View style={styles.tableCol}><Text>{index + 1}</Text></View>
            <View style={styles.tableCol}><Text>{rep.reportedBy}</Text></View>
            <View style={styles.tableCol}><Text>{rep.category}</Text></View>
            <View style={styles.tableCol}><Text>{rep.details}</Text></View>
            <View style={styles.tableCol}><Text>{new Date(rep.created_at).toLocaleString()}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default ReportsPDF;