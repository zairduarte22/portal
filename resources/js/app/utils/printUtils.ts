export const printInvoiceHTML = (
  day: string,
  monthNum: string,
  year: number,
  name: string,
  address: string,
  idStr: string,
  monthStr: string,
  monto_ugavi: number,
  monto_fondo: number,
  total1: number
) => {
  return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              @page {
                  size: 205mm 148mm;
                  margin: 0;
                  padding: 0;
              }
              body {
                  width: 205mm;
                  margin: 0;
                  padding: 4mm;
                  font-family: Arial, sans-serif;
                  font-size: 12.5pt;
                  position: relative;
              }
              
              .pagina {
                  width: 205mm;
                  height: 148mm;
                  position: relative;
                  page-break-after: always;
                  overflow: hidden;
              }
              
              .pagina:last-child {
                  page-break-after: auto;
              }
              
              /* POSICIONAMIENTO ABSOLUTO DE ELEMENTOS */
              
              /* Fecha: top 36-2=34mm | right 162+8=170mm (para mover a la izquierda) */
              .date { 
                  position: absolute; 
                  top: 34mm; 
                  right: 163mm; 
              }
              
              /* Nombre: top 46-4=42mm | left 53+8=61mm */
              .name { 
                  position: absolute; 
                  top: 42mm; 
                  left: 61mm; 
                  font-size: 11.5pt; 
              }
              
              /* Dirección: top 50-4=46mm | left 38+8=46mm */
              .address { 
                  position: absolute; 
                  top: 46mm; 
                  left: 46mm; 
              }
              
              /* ID: top 57-4=53mm | left 150+8=158mm */
              .id { 
                  position: absolute; 
                  top: 53mm; 
                  left: 158mm; 
              }
              
              .items-wrapper {
                  position: absolute;
                  top: 64mm; /* 68-4=64mm */
                  left: 13mm; /* 5+8=13mm */
                  width: 180mm;
                  display: flex;
                  flex-direction: column;
                  gap: 1mm;
              }
              
              .item-container {
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
              }
              
              .item-description {
                  width: 104mm;
                  text-align: left;
                  word-wrap: break-word;
              }
              
              .item-amount {
                  width: 32mm;
                  text-align: right;
              }
              
              /* TOTALES: top -4mm | right -8mm (20-8=12mm) para compensar el desplazamiento */
              .total1 { 
                  position: absolute; 
                  top: 119mm; 
                  right: 12mm; 
                  text-align: right; 
              }
              
              .dash1 { 
                  position: absolute; 
                  top: 122mm; 
                  right: 12mm; 
                  text-align: right; 
              }
              
              .dash2 { 
                  position: absolute; 
                  top: 127mm; 
                  right: 12mm; 
                  text-align: right; 
              }
              
              .final-total { 
                  position: absolute; 
                  top: 132mm; 
                  right: 12mm; 
                  text-align: right; 
              }
              
              /* POSICIONAMIENTO PÁGINA 2 */
              .date2 { position: absolute; top: 44mm; right: 159mm; }
              .name2 { position: absolute; top: 52mm; left: 58mm; font-size: 11.5pt; }
              .address2 { position: absolute; top: 59mm; left: 41mm; }
              .id2 { position: absolute; top: 63mm; left: 160mm; }
      
              .item-container2 {
                  position: absolute;
                  top: 77mm;
                  left: 25mm;
                  width: 168mm;
                  display: flex;
                  justify-content: space-between;
                  font-size: 13.5pt;
              }
      
              .item-description2 { width: 104mm; text-align: left; word-wrap: break-word; }
              .item-amount2 { width: 28mm; text-align: center; }
      
              /* TOTALES PÁGINA 2 */
              .total12 { position: absolute; top: 122mm; right: 18mm; text-align: right; }
              .dash12 { position: absolute; top: 130mm; right: 21mm; text-align: right; }
              .dash22 { position: absolute; top: 137mm; right: 21mm; text-align: right; }
              .final-total2 { position: absolute; top: 143mm; right: 18mm; text-align: right; }
              
              /* AJUSTES DE IMPRESIÓN */
              @media print {
                  .id, .item-amount { color: black !important; }
              }
          </style>
      </head>
      <body>
          <div class="pagina">
              <div class="date">${day} &emsp;${monthNum} &emsp;${year}</div>
          
              <div class="name">${name}</div>
              <div class="address">${address}</div>
              <div class="id">${idStr}</div>

              <div class="items-wrapper">
                  <div class="item-container">
                      <div class="item-description">
                          Cancelación del 60% por cuota correspondiente a ${monthStr}
                      </div>
                      <div class="item-amount">
                          ${monto_ugavi.toFixed(2)}
                      </div>
                  </div>
                  <div class="item-container">
                      <div class="item-description">
                          Cancelación del 20% por cuota correspondiente a ${monthStr}
                      </div>
                      <div class="item-amount">
                          ${monto_fondo.toFixed(2)}
                      </div>
                  </div>
              </div>
          
              <div class="total1">${total1.toFixed(2)}</div>
              <div class="dash1">-</div>
              <div class="dash2">-</div>
              <div class="final-total">${total1.toFixed(2)}</div>
          </div>
      
          <div class="pagina">
              <div class="date2">${day} &emsp;&emsp;${monthNum} &emsp;${year}</div>
          
              <div class="name2">${name}</div>
              <div class="address2">${address}</div>
              <div class="id2">${idStr}</div>
          
              <div class="item-container2">
                  <div class="item-description2">
                      Cancelación del 20% por cuota correspondiente a ${monthStr}
                  </div>
                  <div class="item-amount2">
                      ${monto_fondo.toFixed(2)}
                  </div>
              </div>
          
              <div class="total12">${monto_fondo.toFixed(2)}</div>
              <div class="dash12">-</div>
              <div class="dash22">-</div>
              <div class="final-total2">${monto_fondo.toFixed(2)}</div>
          </div>
      </body>
      </html>
  `;
};
