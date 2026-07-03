import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface CarnetData {
  id: string; // numero_carnet
  es_presidente_director: boolean;
  nombres: string;
  apellidos: string;
  cedula: string;
  hacienda: string;
  fecha_emision: string;
  fecha_vencimiento: string;
}

export const generarPDFCarnet = async (datos: CarnetData) => {
  // Dimensiones del carnet en pt: 152.4 x 241.8 (5.37cm x 8.52cm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [152.4, 241.8]
  });

  const imgFondo = datos.es_presidente_director ? '/img/fondo_director.jpg' : '/img/fondo_regular.jpg';
  
  // Convert image URL to base64
  const imageToBase64 = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  try {
    const fondoBase64 = await imageToBase64(imgFondo);
    doc.addImage(fondoBase64, 'JPEG', 0, 0, 152.4, 241.8);
  } catch (error) {
    console.error("Error cargando el fondo del carnet", error);
  }

  // Colores y fuentes
  const colorTexto = datos.es_presidente_director ? '#C29938' : '#000000'; // RGB(194, 153, 56)
  doc.setTextColor(colorTexto);
  
  // Si tenemos Poppins cargada en jsPDF, usarla. Por ahora usamos Helvetica.
  doc.setFont('helvetica', 'bold');

  const centerX = 152.4 / 2;

  // Nombres y Apellidos
  doc.setFontSize(10);
  doc.text(datos.nombres.toUpperCase(), centerX, 90, { align: 'center' });
  doc.text(datos.apellidos.toUpperCase(), centerX, 102, { align: 'center' });

  // Cédula
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`C.I: ${datos.cedula}`, centerX, 115, { align: 'center' });

  // Hacienda
  doc.setFont('helvetica', 'bold');
  doc.text(datos.hacienda.toUpperCase(), centerX, 128, { align: 'center' });

  // Fechas
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Emisión: ${datos.fecha_emision}`, 20, 145);
  doc.text(`Vence: ${datos.fecha_vencimiento}`, 152.4 - 20, 145, { align: 'right' });

  // QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(datos.id, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 60,
    });
    // Dibujar QR centrado en la parte inferior
    doc.addImage(qrDataUrl, 'PNG', centerX - 30, 160, 60, 60);
  } catch (err) {
    console.error("Error generando QR", err);
  }

  // ID del carnet
  doc.setFontSize(5);
  doc.text(`ID: ${datos.id}`, centerX, 230, { align: 'center' });

  // Descargar
  doc.save(`Carnet_${datos.nombres}_${datos.apellidos}.pdf`);
};
