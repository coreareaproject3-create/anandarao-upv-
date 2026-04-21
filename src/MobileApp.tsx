import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { 
  Activity, 
  Calculator, 
  Mail, 
  Play, 
  LogOut, 
  ChevronRight,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';
import { CorrectionMethod, CalculationResults } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { width } = Dimensions.get('window');
const VS = 5.2; // Steel Velocity (km/s)

const COLORS = {
  bg: '#020617', // Slate 950
  card: '#0f172a', // Slate 900
  accent: '#38bdf8', // Sky 400
  success: '#10b981', // Emerald 500
  error: '#f43f5e', // Rose 500
  text: '#f8fafc', // Slate 50
  textDim: '#64748b', // Slate 400
  border: '#1e293b', // Slate 800
};

export default function MobileApp() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  
  // Calculator States
  const [method, setMethod] = useState<CorrectionMethod>('perpendicular');
  const [pathLength, setPathLength] = useState('150');
  const [pulseTime, setPulseTime] = useState('35');
  const [offsetDistance, setOffsetDistance] = useState('40');
  const [barDiameter, setBarDiameter] = useState('12');

  const calculateResults = (
    m: CorrectionMethod, 
    L: number, 
    T: number, 
    a: number, 
    Ls: number
  ): CalculationResults => {
    const measuredV = L / T;
    let correctedV = measuredV;
    let quality = '';
    let gamma: number | undefined;
    let kFactor: number | undefined;

    if (m === 'perpendicular') {
      gamma = 4.606 / VS;
      kFactor = 1 - (Ls / L) * (1 - gamma);
      correctedV = measuredV * kFactor * 0.9;
    } else if (m === 'parallel') {
      const numerator = 2 * a * VS;
      const termInner = (T * VS) - L;
      const denominator = Math.sqrt(4 * (a ** 2) + Math.pow(termInner, 2));
      const initialCorrectedV = denominator !== 0 ? numerator / denominator : 0;
      correctedV = 1.15 * initialCorrectedV;
    }

    if (correctedV > 4.5) quality = 'Excellent';
    else if (correctedV >= 3.5) quality = 'Good';
    else if (correctedV >= 3.0) quality = 'Medium';
    else quality = 'Doubtful';

    return { measuredVelocity: measuredV, correctedVelocity: correctedV, quality };
  };

  const results = useMemo(() => {
    return calculateResults(
      method, 
      parseFloat(pathLength) || 0, 
      parseFloat(pulseTime) || 1, 
      parseFloat(offsetDistance) || 0, 
      parseFloat(barDiameter) || 0
    );
  }, [method, pathLength, pulseTime, offsetDistance, barDiameter]);

  const generatePDF = () => {
    if (Platform.OS !== 'web') {
      alert('PDF generation is optimized for Web. For Android deployment, please use expo-print or react-native-html-to-pdf.');
      return;
    }
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('WAVE SHIELD', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('TRUE VELOCITY • TRUE STRENGTH', 20, 32);
    
    // Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORY ANALYSIS REPORT', 20, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Analyst: ${user?.name}`, 20, 65);
    doc.text(`Email: ${user?.email}`, 20, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 75);
    doc.text(`Method: ${method.toUpperCase()}`, 20, 80);

    // Results Table
    autoTable(doc, {
      startY: 90,
      head: [['Parameter', 'Value']],
      body: [
        ['Path Length (L)', `${pathLength} mm`],
        ['Pulse Time (T)', `${pulseTime} µs`],
        ['Measured Velocity (Vm)', `${results.measuredVelocity.toFixed(3)} km/s`],
        ['Corrected Velocity (Vc)', `${results.correctedVelocity.toFixed(3)} km/s`],
        ['Concrete Quality', results.quality.toUpperCase()]
      ],
      headStyles: { fillColor: '#0f172a', textColor: '#ffffff' },
      theme: 'grid'
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thiagarajar College of Engineering // Dept. of Civil Engineering', 105, 285, { align: 'center' });

    doc.save(`WAVE_SHIELD_Report_${new Date().getTime()}.pdf`);
  };

  const handleAuth = () => {
    if (tempName && tempEmail) {
      setUser({ name: tempName, email: tempEmail });
    }
  };

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loginCard}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Shield size={56} color={COLORS.accent} strokeWidth={2.5} />
            </View>
            <Text style={styles.logoTitle}>WAVE <Text style={{ color: COLORS.accent }}>SHIELD</Text></Text>
            <View style={styles.sloganBadge}>
              <Text style={styles.logoSlogan}>TRUE VELOCITY • TRUE STRENGTH</Text>
            </View>
          </View>

          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>LABORATORY ACCESS</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>OPERATOR IDENTITY</Text>
            <TextInput 
              style={styles.input} 
              value={tempName} 
              onChangeText={setTempName}
              placeholder="Full Name"
              placeholderTextColor="#475569"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>AUTHORIZATION EMAIL</Text>
            <TextInput 
              style={styles.input} 
              value={tempEmail} 
              onChangeText={setTempEmail}
              placeholder="entername@gmail.com"
              placeholderTextColor="#475569"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>INITIATE SYSTEM</Text>
            <ArrowRight size={18} color="white" strokeWidth={3} />
          </TouchableOpacity>

          <Text style={styles.authLegal}>PROTECTED LAB ENVIRONMENT // TCE CIVIL DEPT</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Shield size={24} color={COLORS.accent} strokeWidth={3} />
          <Text style={styles.headerTitle}>WAVE SCANNER <Text style={{ color: COLORS.accent, fontSize: 10 }}>V2.1</Text></Text>
        </View>
        <TouchableOpacity onPress={() => setUser(null)} style={styles.logoutBtn}>
          <LogOut size={20} color={COLORS.textDim} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userBar}>
          <Clock size={14} color={COLORS.accent} />
          <Text style={styles.userBarText}>OPERATOR: {user.name.toUpperCase()} // ACTIVE SESSION</Text>
        </View>

        <View style={styles.methodContainer}>
          {(['perpendicular', 'parallel', 'no-correction'] as CorrectionMethod[]).map((m) => (
            <TouchableOpacity 
              key={m}
              style={[styles.methodTab, method === m && styles.methodTabActive]}
              onPress={() => setMethod(m)}
            >
              <Text style={[styles.methodTabText, method === m && styles.methodTabTextActive]}>
                {m.split('-')[0].toUpperCase()}
              </Text>
              {method === m && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instrumentSection}>
          <View style={styles.sectionHeader}>
            <Activity size={14} color={COLORS.accent} />
            <Text style={styles.sectionTitleText}>SENSOR ACQUISITION</Text>
          </View>
          
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>PATH L (mm)</Text>
              <TextInput 
                style={styles.instrumentInput} 
                value={pathLength} 
                onChangeText={setPathLength}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>TIME T (µs)</Text>
              <TextInput 
                style={styles.instrumentInput} 
                value={pulseTime} 
                onChangeText={setPulseTime}
                keyboardType="numeric"
              />
            </View>
          </View>

          {method === 'parallel' && (
            <View style={[styles.gridRow, { marginTop: 16 }]}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>OFFSET a (mm)</Text>
                <TextInput 
                  style={styles.instrumentInput} 
                  value={offsetDistance} 
                  onChangeText={setOffsetDistance}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridCol}>
                <View style={[styles.instrumentInput, { borderColor: 'transparent', backgroundColor: 'transparent' }]} />
              </View>
            </View>
          )}

          {method === 'perpendicular' && (
            <View style={[styles.gridRow, { marginTop: 16 }]}>
              <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>REBAR ø (mm)</Text>
                <TextInput 
                  style={styles.instrumentInput} 
                  value={barDiameter} 
                  onChangeText={setBarDiameter}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridCol}>
                <View style={[styles.instrumentInput, { borderColor: 'transparent', backgroundColor: 'transparent' }]} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.oledDisplay}>
          <View style={styles.oledHeader}>
            <Text style={styles.oledLabel}>ANALYSIS OUTPUT</Text>
            <View style={styles.pulseDot} />
          </View>

          <View style={styles.mainReadout}>
            <Text style={styles.readoutValue}>{results.correctedVelocity.toFixed(3)}</Text>
            <Text style={styles.readoutUnit}>km/s</Text>
          </View>

          <View style={styles.statusIndicator}>
            <Text style={[styles.statusText, { color: results.quality === 'Doubtful' ? COLORS.error : COLORS.success }]}>
              {results.quality.toUpperCase()} QUALITY DETECTED
            </Text>
          </View>

          <View style={styles.subGrid}>
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>MEASURED</Text>
              <Text style={styles.subValue}>{results.measuredVelocity.toFixed(3)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>CONSTANT VS</Text>
              <Text style={styles.subValue}>5.200</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.tacticalReportBtn} onPress={generatePDF}>
          <Text style={styles.tacticalReportText}>EXPORT LABORATORY REPORT</Text>
          <View style={styles.btnIcon}>
            <ChevronRight size={18} color="white" strokeWidth={3} />
          </View>
        </TouchableOpacity>

        <Text style={styles.footerLegal}>WAVE SHIELD PRECISION INSTRUMENTS • CIVIL ANALYTICS DIV</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loginContainer: { 
    flex: 1, 
    backgroundColor: COLORS.bg, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 24
  },
  loginCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 32,
    borderRadius: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  logoContainer: { alignItems: 'center', marginBottom: 44 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: `${COLORS.accent}40`,
    backgroundColor: `${COLORS.accent}08`,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  logoTitle: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: 'white', 
    letterSpacing: -1.5, 
    marginTop: 16 
  },
  sloganBadge: {
    marginTop: 8,
    backgroundColor: `${COLORS.accent}15`,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
  },
  logoSlogan: { 
    fontSize: 9, 
    fontWeight: '900', 
    color: COLORS.accent, 
    letterSpacing: 2.5,
  },
  loginHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textDim,
    letterSpacing: 4,
  },
  titleLine: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.accent,
    marginTop: 12,
    borderRadius: 1.5,
  },
  inputGroup: { marginBottom: 24 },
  label: { 
    color: COLORS.accent, 
    fontSize: 10, 
    fontWeight: '900', 
    marginBottom: 10,
    letterSpacing: 2 
  },
  input: {
    backgroundColor: '#ffffff05',
    color: 'white',
    padding: 18,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 4,
  },
  primaryButtonText: { 
    color: COLORS.bg, 
    fontWeight: '900', 
    letterSpacing: 3, 
    marginRight: 10,
    fontSize: 13,
  },
  authLegal: {
    marginTop: 32,
    color: '#334155',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  logoutBtn: { padding: 8, backgroundColor: '#ffffff05', borderRadius: 8 },

  content: { flex: 1, padding: 20 },
  userBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 20,
    backgroundColor: '#ffffff05',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userBarText: { fontSize: 9, fontWeight: '900', color: COLORS.textDim, letterSpacing: 1.5 },

  methodContainer: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.card, 
    padding: 6, 
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodTab: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
  methodTabActive: { backgroundColor: '#ffffff08', borderRadius: 8 },
  methodTabText: { fontSize: 10, fontWeight: '900', color: COLORS.textDim, letterSpacing: 1 },
  methodTabTextActive: { color: COLORS.accent },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },

  instrumentSection: { 
    backgroundColor: COLORS.card, 
    padding: 20, 
    marginBottom: 20, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitleText: { fontSize: 10, fontWeight: '900', color: COLORS.accent, letterSpacing: 2 },
  gridRow: { flexDirection: 'row', gap: 16 },
  gridCol: { flex: 1 },
  fieldLabel: { fontSize: 9, fontWeight: '900', color: COLORS.textDim, marginBottom: 8, letterSpacing: 1 },
  instrumentInput: { 
    backgroundColor: COLORS.bg, 
    color: COLORS.text,
    padding: 14, 
    fontSize: 18, 
    fontWeight: '900', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  oledDisplay: { 
    backgroundColor: '#000000', 
    padding: 30, 
    borderRadius: 16, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${COLORS.accent}40`,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  oledHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  oledLabel: { color: COLORS.accent, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
  mainReadout: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginVertical: 12 },
  readoutValue: { 
    color: 'white', 
    fontSize: 64, 
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: -2,
  },
  readoutUnit: { color: COLORS.accent, fontSize: 14, fontWeight: '900', marginLeft: 8, marginBottom: 12 },
  statusIndicator: { 
    marginTop: 10, 
    paddingVertical: 8, 
    borderTopWidth: 1, 
    borderTopColor: '#ffffff10',
    borderBottomWidth: 1, 
    borderBottomColor: '#ffffff10' 
  },
  statusText: { fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 1.5 },
  subGrid: { flexDirection: 'row', marginTop: 24, paddingHorizontal: 10 },
  subItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#ffffff10', marginVertical: 4 },
  subLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '900', marginBottom: 6 },
  subValue: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  tacticalReportBtn: {
    backgroundColor: COLORS.accent,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 40,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tacticalReportText: { color: COLORS.bg, fontWeight: '900', letterSpacing: 1.5, fontSize: 12 },
  btnIcon: { backgroundColor: COLORS.bg, padding: 6, borderRadius: 4 },
  footerLegal: {
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textDim,
    letterSpacing: 2,
    marginBottom: 40,
    opacity: 0.4
  }
});
