Seguí en la rama `ia_desarrollo`. Plan corto antes de arrancar.

1) SACAR LA IMPORTACIÓN DE PDF (por ahora)
Vamos a dejar esta función para más adelante. Quitá:
- El botón "Subir Lista (PDF)" de CristalesPage.jsx y toda la interfaz 
  de vista previa/confirmación que se armó para eso
- Los endpoints POST /api/cristales/importar-pdf y 
  /api/cristales/confirmar-importacion, y cualquier lógica de parseo de 
  PDF asociada (repository/service/controller/routes)
No hace falta tocar nada de la tabla `cristales` ni del alta manual — 
eso se queda tal como está. Es solo la parte de subir el PDF la que sale.

2) TOGGLES DE TRATAMIENTO EN VEZ DE TEXTO LIBRE
En el formulario de Nuevo/Editar Cristal, reemplazá el campo de texto 
libre "Tratamiento" por 3 toggles más, con el mismo estilo visual que 
el de "Con Antirreflejo" que ya existe:
- Fotocromático
- Blue Cut
- Blanco (la opción base, sin tratamiento especial, la más económica)

Comportamiento: Blanco es excluyente con Blue Cut y Fotocromático — si 
activo "Blanco", apagá automáticamente los otros dos, y si activo 
cualquiera de esos dos, apagá "Blanco". Blue Cut y Fotocromático sí 
pueden estar los dos activos juntos (existe esa combinación real en el 
catálogo del laboratorio). "Con Antirreflejo" sigue siendo independiente 
de estos tres, se puede combinar con cualquiera.

- Backend: en la tabla cristales, agregá las columnas con_blue_cut y 
  con_fotocromatico (booleanas), además de la con_antirreflejo que ya 
  existe. Para "Blanco" no hace falta una columna nueva: es simplemente 
  el estado en que con_blue_cut y con_fotocromatico están ambos en 
  falso — mostralo así en el formulario (el toggle "Blanco" es visual, 
  representa ese estado, no se guarda como columna aparte).
- Dejá un campo de texto opcional "Otro tratamiento" abajo de los 
  toggles, para casos que no entren en ninguna de estas 3 categorías 
  (ej. "Antiage + Infrarrojo").
- Actualizá el repository/service/controller/rutas de cristales para 
  guardar y devolver estos campos, y CristalesPage.jsx para mostrar 
  los tratamientos como tags/badges en la tabla en vez del texto libre 
  de antes.

CÓMO TRABAJAR
- Plan primero, después ejecutá de corrido
- Sacá una captura del formulario de Nuevo Cristal con los toggles 
  nuevos, probando que Blanco y Blue Cut se excluyen entre sí
- Al final, resumime qué quedó hecho