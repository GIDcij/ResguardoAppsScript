function enviarCorreoDesdeCalendario() {
  var calendarId = 'resguardacij@gmail.com'; // Reemplaza con tu ID de calendario

  // Obtén los eventos del calendario para el próximo año
  var ahora = new Date();
  var futuro = new Date(ahora.getTime() + 365 * 24 * 60 * 60 * 1000);

  Logger.log("Buscando eventos desde: " + ahora + " hasta: " + futuro);

  var eventos = CalendarApp.getCalendarById(calendarId).getEvents(ahora, futuro);
  
  Logger.log("Eventos obtenidos: " + eventos.length);
  
  for (var i = 0; i < eventos.length; i++) {
    var evento = eventos[i];
    var descripcion = evento.getDescription();
    var titulo = evento.getTitle();
    
    Logger.log("Procesando evento: " + titulo);
    
    // Verifica si el evento ya ha sido procesado
    if (titulo.indexOf("📧") === -1) {
      var datos = obtenerDatosDesdeDescripcion(descripcion, evento);
      datos.id = evento.getId(); // Agregar ID del evento a los datos
      Logger.log("Datos obtenidos para el correo: " + JSON.stringify(datos));
      if (datos.email && datos.nombre && datos.numero) {
        enviarCorreo(datos);
        
        // Agrega un emoji al título para indicar que el correo ya fue enviado
        evento.setTitle("📧 " + titulo);
        Logger.log("Correo enviado y título actualizado: " + evento.getTitle());
      } else {
        Logger.log("Datos incompletos para enviar el correo para el evento: " + titulo);
      }
    } else {
      Logger.log("El correo de confirmación ya fue enviado para el evento: " + titulo);
    }
  }
}

function enviarRecordatorioDesdeCalendario() {
  var calendarId = 'resguardacij@gmail.com'; // Reemplaza con tu ID de calendario

  // Obtén los eventos del calendario para el día siguiente
  var ahora = new Date();
  var inicio = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
  var fin = new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000);

  Logger.log("Buscando eventos desde: " + inicio + " hasta: " + fin);

  var eventos = CalendarApp.getCalendarById(calendarId).getEvents(inicio, fin);
  
  Logger.log("Eventos obtenidos para recordatorio: " + eventos.length);
  
  for (var i = 0; i < eventos.length; i++) {
    var evento = eventos[i];
    var descripcion = evento.getDescription();
    
    Logger.log("Procesando evento para recordatorio: " + evento.getTitle());
    
    // Verifica si el recordatorio ya ha sido enviado
    if (descripcion.indexOf("Recordatorio enviado") === -1) {
      var datos = obtenerDatosDesdeDescripcion(descripcion, evento);
      datos.id = evento.getId(); // Agregar ID del evento a los datos
      Logger.log("Datos obtenidos para el recordatorio: " + JSON.stringify(datos));
      if (datos.email && datos.nombre && datos.numero) {
        enviarRecordatorio(datos, evento);
        
        // Agrega un texto a la descripción para indicar que el recordatorio ya fue enviado
        descripcion += "\nRecordatorio enviado";
        evento.setDescription(descripcion);
        Logger.log("Recordatorio enviado y descripción actualizada: " + evento.getTitle());
      } else {
        Logger.log("Datos incompletos para enviar el recordatorio para el evento: " + evento.getTitle());
      }
    } else {
      Logger.log("El recordatorio ya fue enviado para el evento: " + evento.getTitle());
    }
  }
}

function obtenerDatosDesdeDescripcion(descripcion, evento) {
  var datos = {};

  // Divide la descripción en líneas
  var lineas = descripcion.split("\n");
  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i];
    if (linea.indexOf("Email:") !== -1) {
      datos.email = linea.split(":")[1].trim();
    } else if (linea.indexOf("Nombre:") !== -1) {
      datos.nombre = linea.split(":")[1].trim();
    } else if (linea.indexOf("Numero:") !== -1) {
      datos.numero = linea.split(":")[1].trim();
    } else if (linea.indexOf("Profesional:") !== -1) {
      datos.profesional = linea.split(":")[1].trim();
    }
  }
  
  // Obtiene la fecha y hora del evento
  datos.fechaHora = evento.getStartTime();
  
  Logger.log("Datos extraídos: " + JSON.stringify(datos));
  
  return datos;
}

function enviarCorreo(datos) {
  var asunto = "Confirmación de turno";
  var cuerpo = generarHtmlCorreo(datos);
  
  MailApp.sendEmail({
    to: datos.email,
    subject: asunto,
    htmlBody: cuerpo
  });
  Logger.log("Correo enviado a: " + datos.email);
}

function enviarRecordatorio(datos, evento) {
  var asunto = "Recordatorio de turno";
  var cuerpo = generarHtmlRecordatorio(datos);
  
  MailApp.sendEmail({
    to: datos.email,
    subject: asunto,
    htmlBody: cuerpo
  });
  
  Logger.log("Recordatorio enviado a: " + datos.email);
}

function enviarCorreoConfirmacion(datos) {
  var asunto = "Turno confirmado";
  var cuerpo = generarHtmlConfirmacion(datos);
  
  MailApp.sendEmail({
    to: datos.email,
    subject: asunto,
    htmlBody: cuerpo
  });
  Logger.log("Correo de confirmación enviado a: " + datos.email);
}

function enviarCorreoCancelacion(datos) {
  var asunto = "Turno cancelado";
  var cuerpo = generarHtmlCancelacion(datos);
  
  MailApp.sendEmail({
    to: datos.email,
    subject: asunto,
    htmlBody: cuerpo
  });
  Logger.log("Correo de cancelación enviado a: " + datos.email);
}

function generarHtmlCorreo(datos) {
  var html = '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Confirmación de Turno</title>' +
      '<style>' +
          'body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }' +
          '.container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border: 1px solid #dddddd; border-radius: 8px; }' +
          '.header { background-color: #006473; color: white; padding: 10px; border-radius: 8px 8px 0 0; text-align: center; }' +
          '.header img { width: 350px; height: auto; }' + // Establecer el tamaño de la imagen
          '.content { padding: 20px; }' +
          '.content h1 { font-size: 18px; color: #333333; }' +
          '.content p { font-size: 14px; color: #555555; }' +
          '.content a { color: #006473; text-decoration: none; }' +
          '.content a:hover { text-decoration: underline; }' +
          '.footer { margin-top: 20px; font-size: 12px; color: #777777; text-align: center; }' +
      '</style>' +
  '</head>' +
  '<body>' +
      '<div class="container">' +
          '<div class="header">' +
              '<img src="https://i.ibb.co/MDK8bL0/download.png" alt="Logo">' +
              '<h2>Resguardo - Turno</h2>' +
          '</div>' +
          '<div class="content">' +
              '<h1>Hola ' + datos.nombre + '</h1>' +
              '<p>Te confirmamos que tienes un turno reservado.</p>' +
              '<p><strong>Día / Hora:</strong> ' + datos.fechaHora.toLocaleString() + '</p>' +
              '<p><a href="#">Agregar al calendario</a></p>' +
              '<p>El turno tiene una tolerancia por demora de 15 min.</p>' +
              '<p><strong>Profesional / Equipo:</strong> ' + datos.profesional + '</p>' +
              '<p><strong>Modalidad:</strong> Presencial</p>' +
              '<p><strong>Dirección:</strong> Chacabuco 151, Congreso - Cdad Autónoma Bs As <a href="#">Ver mapa</a></p>' +
              '<p><strong>Nro. Turno:</strong> ' + datos.numero + '</p>' +
          '</div>' +
          '<div class="footer">' +
          '</div>' +
      '</div>' +
  '</body>' +
  '</html>';

  return html;
}

function generarHtmlRecordatorio(datos) {
  var aceptarUrl = "https://wa.me/541135032234?text=" + encodeURIComponent("Confirmo la asistencia del turno " + datos.numero + " a nombre de " + datos.nombre + " el día y fecha " + datos.fechaHora.toLocaleString());
  var rechazarUrl = "https://wa.me/541135032234?text=" + encodeURIComponent("Cancelo el turno " + datos.numero + " a nombre de " + datos.nombre + " el día y fecha " + datos.fechaHora.toLocaleString());

  var html = '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Recordatorio de Turno</title>' +
      '<style>' +
          'body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }' +
          '.container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border: 1px solid #dddddd; border-radius: 8px; }' +
          '.header { background-color: #006473; color: white; padding: 10px; border-radius: 8px 8px 0 0; text-align: center; }' +
          '.header img { width: 350px; height: auto; }' + // Establecer el tamaño de la imagen
          '.content { padding: 20px; }' +
          '.content h1 { font-size: 18px; color: #333333; }' +
          '.content p { font-size: 14px; color: #555555; }' +
          '.content a { color: #006473; text-decoration: none; }' +
          '.content a:hover { text-decoration: underline; }' +
          '.footer { margin-top: 20px; font-size: 12px; color: #777777; text-align: center; }' +
          '.buttons { text-align: center; margin-top: 20px; }' +
          '.button { display: inline-block; padding: 10px 40px; margin: 10px; font-size: 14px; color: #ffffff; background-color: #006473; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; }' +
          '.button.accept { background-color: #28a745; }' +
          '.button.decline { background-color: #dc3545; }' +
          '.button:hover { opacity: 0.8; }' +
      '</style>' +
  '</head>' +
  '<body>' +
      '<div class="container">' +
          '<div class="header">' +
              '<img src="https://i.ibb.co/MDK8bL0/download.png" alt="Logo">' +
              '<h2>Resguardo - Turno</h2>' +
          '</div>' +
          '<div class="content">' +
              '<h1>Hola ' + datos.nombre + '</h1>' +
              '<p>Te confirmamos que tienes un turno reservado.</p>' +
              '<p><strong>Día / Hora:</strong> ' + datos.fechaHora.toLocaleString() + '</p>' +
              '<p><a href="#">Agregar al calendario</a></p>' +
              '<p>El turno tiene una tolerancia por demora de 15 min.</p>' +
              '<p><strong>Profesional / Equipo:</strong> ' + datos.profesional + '</p>' +
              '<p><strong>Modalidad:</strong> Presencial</p>' +
              '<p><strong>Dirección:</strong> Chacabuco 151, Congreso - Cdad Autónoma Bs As <a href="#">Ver mapa</a></p>' +
              '<p><strong>Nro. Turno:</strong> ' + datos.numero + '</p>' +
              '<div class="buttons">' +
                  '<a href="' + aceptarUrl + '" class="button accept">Aceptar</a>' +
                  '<a href="' + rechazarUrl + '" class="button decline">Rechazar</a>' +
              '</div>' +
          '</div>' +
          '<div class="footer">' +
          '</div>' +
      '</div>' +
  '</body>' +
  '</html>';

  return html;
}


function generarHtmlConfirmacion(datos) {
  var html = '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Turno Confirmado</title>' +
      '<style>' +
          'body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }' +
          '.container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border: 1px solid #dddddd; border-radius: 8px; }' +
          '.header { background-color: #006473; color: white; padding: 10px; border-radius: 8px 8px 0 0; text-align: center; }' +
          '.header img { width: 350px; height: auto; }' + // Establecer el tamaño de la imagen
          '.content { padding: 20px; }' +
          '.content h1 { font-size: 18px; color: #333333; }' +
          '.content p { font-size: 14px; color: #555555; }' +
          '.content a { color: #006473; text-decoration: none; }' +
          '.content a:hover { text-decoration: underline; }' +
          '.footer { margin-top: 20px; font-size: 12px; color: #777777; text-align: center; }' +
      '</style>' +
  '</head>' +
  '<body>' +
      '<div class="container">' +
          '<div class="header">' +
              '<img src="https://i.ibb.co/MDK8bL0/download.png" alt="Logo">' +
              '<h2>Resguardo - Turno</h2>' +
          '</div>' +
          '<div class="content">' +
              '<h1>Hola ' + datos.nombre + '</h1>' +
              '<p>Te confirmamos que tu turno ha sido confirmado.</p>' +
              '<p><strong>Día / Hora:</strong> ' + datos.fechaHora.toLocaleString() + '</p>' +
              '<p><strong>Profesional / Equipo:</strong> ' + datos.profesional + '</p>' +
              '<p><strong>Modalidad:</strong> Presencial</p>' +
              '<p><strong>Dirección:</strong> Chacabuco 151, Congreso - Cdad Autónoma Bs As <a href="#">Ver mapa</a></p>' +
              '<p><strong>Nro. Turno:</strong> ' + datos.numero + '</p>' +
              '<p>Si necesitas más información, <a href="https://wa.me/+541135032234?text=Más%20información%20sobre%20mi%20turno">haz clic aquí</a>.</p>' +
          '</div>' +
          '<div class="footer">' +
              '<p>Si no puedes asistir, por favor cancela tu turno respondiendo a este correo.</p>' +
          '</div>' +
      '</div>' +
  '</body>' +
  '</html>';
  
  return html;
}

function generarHtmlCancelacion(datos) {
  var html = '<!DOCTYPE html>' +
  '<html lang="es">' +
  '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Turno Cancelado</title>' +
      '<style>' +
          'body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }' +
          '.container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border: 1px solid #dddddd; border-radius: 8px; }' +
          '.header { background-color: #006473; color: white; padding: 10px; border-radius: 8px 8px 0 0; text-align: center; }' +
          '.header img { width: 350px; height: auto; }' + // Establecer el tamaño de la imagen
          '.content { padding: 20px; }' +
          '.content h1 { font-size: 18px; color: #333333; }' +
          '.content p { font-size: 14px; color: #555555; }' +
          '.content a { color: #006473; text-decoration: none; }' +
          '.content a:hover { text-decoration: underline; }' +
          '.footer { margin-top: 20px; font-size: 12px; color: #777777; text-align: center; }' +
      '</style>' +
  '</head>' +
  '<body>' +
      '<div class="container">' +
          '<div class="header">' +
              '<img src="https://i.ibb.co/MDK8bL0/download.png" alt="Logo">' +
              '<h2>Resguardo - Turno</h2>' +
          '</div>' +
          '<div class="content">' +
              '<h1>Hola ' + datos.nombre + '</h1>' +
              '<p>Te informamos que tu turno ha sido cancelado.</p>' +
              '<p><strong>Día / Hora:</strong> ' + datos.fechaHora.toLocaleString() + '</p>' +
              '<p><strong>Profesional / Equipo:</strong> ' + datos.profesional + '</p>' +
              '<p><strong>Modalidad:</strong> Presencial</p>' +
              '<p><strong>Dirección:</strong> Chacabuco 151, Congreso - Cdad Autónoma Bs As <a href="#">Ver mapa</a></p>' +
              '<p><strong>Nro. Turno:</strong> ' + datos.numero + '</p>' +
              '<p>Para reprogramar tu turno, <a href="https://wa.me/+541135032234?text=Reprogramar%20turno%20para%20' + encodeURIComponent(datos.nombre) + '">haz clic aquí</a>.</p>' +
          '</div>' +
          '<div class="footer">' +
              '<p>Si necesitas más información, por favor contáctanos respondiendo a este correo.</p>' +
          '</div>' +
      '</div>' +
  '</body>' +
  '</html>';
  
  return html;
}
