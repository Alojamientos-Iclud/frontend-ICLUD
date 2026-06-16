const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASS,
    },
});

// DEBUG temporal - borralo una vez que funcione
console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_APP_PASS:", process.env.MAIL_APP_PASS ? "cargada" : "❌ undefined");

async function enviarMailConfirmacion({ nombre_completo, gmail, hotel, llegada, salida, noches, cantidad_huespedes, precioNoche, precioTotal, stripeUrl }) {

    // Sumamos 1 día para compensar el desfase de UTC al parsear fechas sin hora
    const parsearFecha = (str) => {
        const [year, month, day] = str.split('-').map(Number);
        return new Date(year, month - 1, day); // fecha LOCAL sin UTC
    };

    const fechaLlegada = parsearFecha(llegada).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    const fechaSalida  = parsearFecha(salida).toLocaleDateString('es-AR',  { day: '2-digit', month: 'long', year: 'numeric' });

    const formatARS = (monto) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              
              <!-- HEADER -->
              <tr>
                <td style="background:#1a1a2e;padding:32px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;">ICLUD</h1>
                  <p style="color:#a0a0c0;margin:6px 0 0;font-size:14px;">Confirmación de reserva</p>
                </td>
              </tr>

              <!-- SALUDO -->
              <tr>
                <td style="padding:36px 40px 0;">
                  <h2 style="color:#1a1a2e;margin:0 0 8px;">¡Hola, ${nombre_completo}! 👋</h2>
                  <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">
                    Recibimos tu solicitud de reserva. Revisá los detalles a continuación y cuando estés listo, 
                    hacé clic en el botón para completar el pago de forma segura con Stripe.
                  </p>
                </td>
              </tr>

              <!-- DETALLE DE RESERVA -->
              <tr>
                <td style="padding:28px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border-radius:10px;padding:24px;border:1px solid #e8eaf6;">
                    <tr>
                      <td style="padding-bottom:16px;">
                        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Alojamiento</p>
                        <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#1a1a2e;">${hotel.nombre}</p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="50%" style="padding-right:12px;">
                              <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Llegada</p>
                              <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#333;">📅 ${fechaLlegada}</p>
                            </td>
                            <td width="50%">
                              <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Salida</p>
                              <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#333;">📅 ${fechaSalida}</p>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top:16px;">
                              <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Huéspedes</p>
                              <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#333;">🧑‍🤝‍🧑 ${cantidad_huespedes} persona${cantidad_huespedes > 1 ? 's' : ''}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- DESGLOSE DE PRECIO -->
                    <tr>
                      <td style="padding-top:20px;border-top:1px solid #e0e3f0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size:13px;color:#888;padding-bottom:6px;">
                              ${formatARS(precioNoche)} x ${noches} noche${noches > 1 ? 's' : ''}
                            </td>
                            <td align="right" style="font-size:13px;color:#888;padding-bottom:6px;">${formatARS(precioTotal)}</td>
                          </tr>
                          <tr>
                            <td style="font-size:16px;font-weight:bold;color:#1a1a2e;padding-top:8px;border-top:1px solid #e0e3f0;">Total a pagar</td>
                            <td align="right" style="font-size:22px;font-weight:bold;color:#1a1a2e;padding-top:8px;border-top:1px solid #e0e3f0;">${formatARS(precioTotal)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- BOTÓN DE PAGO -->
              <tr>
                <td style="padding:0 40px 40px;" align="center">
                  <a href="${stripeUrl}" 
                     style="display:inline-block;background:#635bff;color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:8px;font-size:16px;font-weight:bold;letter-spacing:0.5px;">
                    💳 Completar pago con Stripe
                  </a>
                  <p style="color:#999;font-size:12px;margin:16px 0 0;">
                    Este enlace es válido por 24 horas. Si no realizaste esta reserva, ignorá este mail.
                  </p>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background:#f8f9ff;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                  <p style="color:#aaa;font-size:12px;margin:0;">© 2026 ICLUD — Proyecto de Prácticas Profesionalizantes</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"ICLUD Reservas" <${process.env.MAIL_USER}>`,
        to: gmail,
        subject: `Confirmación de reserva — ${hotel.nombre}`,
        html,
    });
}

module.exports = { enviarMailConfirmacion };