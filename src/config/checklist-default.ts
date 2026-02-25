// ============================================================================
//  CENTINELA — Default Checklist Configuration
// ============================================================================

import type { ChecklistSection } from '@/types';

export const DEFAULT_CHECKLIST_DATA: ChecklistSection[] = [
  {
    id: 'disciplina',
    title: 'Módulo 1: Apertura (Diario)',
    icon: 'Shield',
    questions: [
      '1.1 ¿Están intactos los accesos perimetrales, puertas y cerraduras, sin indicios de manipulación?',
      '1.2 ¿El sistema de alarma se desactivó correctamente y sin generar alertas de intrusión?',
      '1.3 ¿Todas las cámaras de seguridad (internas/externas) están operativas y grabando correctamente?',
      '1.4 ¿Toda la iluminación de las zonas operativas y comunes funciona correctamente?',
      '1.5 ¿Las salidas de emergencia y rutas de evacuación están 100% despejadas y accesibles?',
      '1.6 ¿Los equipos de emergencia (extintores, botiquines) están en su lugar y en buen estado?',
      '1.7 ¿El conteo de apertura de artículos críticos coincide con el registro del cierre anterior?',
      '1.8 ¿Los equipos de manejo de materiales (montacargas, etc.) están en su zona y operativos?',
      '1.9 ¿La bitácora del turno de noche o guardia de seguridad no reporta novedades de riesgo?',
      '1.10 ¿Todo el personal que ingresa porta su uniforme completo e identificación visible?',
    ],
    feedback: {
      critical: 'Riesgo Crítico en Apertura. El turno inicia con vulnerabilidades graves que deben ser atendidas de inmediato.',
      warning: 'Apertura con Advertencias. Se detectaron fallos menores que deben ser corregidos para asegurar la operación.',
      optimal: 'Apertura Óptima. El almacén está seguro y listo para operar sin riesgos identificados.',
    },
  },
  {
    id: 'entorno',
    title: 'Módulo 2: Cierre (Diario)',
    icon: 'Users',
    questions: [
      '2.1 ¿El recuento de cierre de artículos críticos coincide con el saldo teórico del sistema?',
      '2.2 ¿Toda la mercancía de alto valor está guardada y asegurada en su área designada?',
      '2.3 ¿Los contenedores de basura y compactadoras han sido revisados para prevenir sustracciones?',
      '2.4 ¿Todas las puertas, portones de andén y ventanas están cerrados y asegurados?',
      '2.5 ¿El sistema de alarma se activó correctamente y la central de monitoreo confirmó la activación?',
      '2.6 ¿Todas las llaves, tarjetas de acceso y radios fueron devueltos y están en el tablero de control?',
      '2.7 ¿Las áreas de trabajo quedaron limpias y ordenadas, sin material que pueda ocultar productos?',
      '2.8 ¿Todos los equipos no esenciales (luces, ordenadores, cargadores) han sido apagados?',
      '2.9 ¿El reporte de incidencias del día ha sido completado y enviado a quien corresponde?',
      '2.10 ¿El responsable del cierre ha firmado la bitácora confirmando la finalización de todos los puntos?',
    ],
    feedback: {
      critical: 'Cierre Deficiente. El almacén queda expuesto a riesgos significativos durante la noche.',
      warning: 'Cierre con Observaciones. Algunas tareas no se completaron, requiere seguimiento.',
      optimal: 'Cierre Seguro. El almacén está correctamente asegurado y los procesos conciliados.',
    },
  },
  {
    id: 'operacion',
    title: 'Módulo 3: Procesos y Operación',
    icon: 'Package',
    questions: [
      '3.1 (Auditoría) ¿El personal de recepción está verificando el 100% de la mercancía contra la orden de compra?',
      '3.2 (Auditoría) ¿El personal de despacho está realizando la doble verificación para evitar errores de envío?',
      '3.3 (Observación) ¿El control de acceso a zonas restringidas se está respetando en todo momento?',
      '3.4 ¿Todas las pertenencias personales del equipo están guardadas en los lockers designados?',
      '3.5 ¿Los visitantes y contratistas están debidamente registrados, identificados y escoltados?',
      '3.6 ¿La merma se procesa y registra según el protocolo para evitar sustracciones?',
      '3.7 ¿El protocolo de manejo y custodia de llaves de áreas críticas se está cumpliendo?',
      '3.8 (Auditoría) ¿Las devoluciones de mercancía cuentan con la documentación de soporte completa?',
      '3.9 ¿El procedimiento de desactivación de etiquetas antihurto se realiza solo en el punto final?',
      '3.10 ¿Los procedimientos de manejo de efectivo (si aplica) se siguen sin excepciones?',
    ],
    feedback: {
      critical: 'Fallas Graves de Proceso. Alto riesgo de pérdida interna o errores operativos costosos.',
      warning: 'Desviaciones en la Operación. Se necesita re-entrenamiento y supervisión en protocolos clave.',
      optimal: 'Operación Controlada. Los procesos se ejecutan de manera fiable y segura.',
    },
  },
  {
    id: 'vigilancia',
    title: 'Módulo 4: Inventario y Activos',
    icon: 'Camera',
    questions: [
      '4.1 (Conteo Cíclico) ¿La cantidad física de un SKU de alto valor auditado coincide con el sistema?',
      '4.2 (Conteo Cíclico) ¿El conteo de una ubicación de almacén aleatoria es 100% correcto?',
      '4.3 ¿Las investigaciones de discrepancias de inventario anteriores están todas cerradas con causa raíz identificada?',
      '4.4 ¿Todos los ajustes de inventario negativos tienen justificación y autorización gerencial?',
      '4.5 (Inspección) ¿La revisión aleatoria de cajas en estanterías no ha revelado "cajas vacías"?',
      '4.6 ¿Toda la mercancía en el área de recepción está etiquetada y registrada en el sistema?',
      '4.7 ¿El sistema de inventario está libre de saldos negativos sin resolver?',
      '4.8 ¿Todas las transferencias de mercancía entre áreas están documentadas y firmadas?',
      '4.9 ¿El inventario de activos de la empresa (scanners, etc.) está completo y actualizado?',
      '4.10 ¿La ubicación física de los productos coincide con la ubicación registrada en el sistema (slotting)?',
    ],
    feedback: {
      critical: 'Control de Inventario Deficiente. Riesgo elevado de pérdida desconocida y desabastecimiento.',
      warning: 'Discrepancias de Inventario. Se requiere atención para corregir imprecisiones en el sistema.',
      optimal: 'Inventario Fiable. Los registros del sistema son un reflejo preciso de la realidad física.',
    },
  },
  {
    id: 'respuesta',
    title: 'Módulo 5: Respuesta a Incidencias',
    icon: 'Siren',
    questions: [
      '5.1 ¿Se aplicó el protocolo establecido para cada incidencia reportada?',
      '5.2 ¿Todos los eventos relevantes del día fueron documentados formalmente en la bitácora o sistema?',
      '5.3 ¿Las incidencias se comunicaron a tiempo a las personas y departamentos correspondientes?',
      '5.4 ¿Las acciones correctivas implementadas anteriormente han demostrado ser efectivas?',
      '5.5 ¿Los procedimientos actuales de seguridad son suficientes y se están cumpliendo?',
      '5.6 ¿Los protocolos de emergencia fueron seguidos correctamente, si aplicó?',
      '5.7 ¿Los patrones de incidencias recurrentes están siendo analizados y gestionados?',
      '5.8 ¿La respuesta del equipo ante situaciones de seguridad ha sido adecuada y coordinada?',
      '5.9 ¿Los registros de eventos y bitácoras están completos y al día?',
      '5.10 ¿Las lecciones aprendidas de incidentes pasados se han comunicado y aplicado?',
    ],
    feedback: {
      critical: 'Gestión de Incidencias Ineficaz. El equipo no está preparado y los riesgos no se mitigan.',
      warning: 'Respuesta a Incidencias Mejorable. La documentación o comunicación necesita ser reforzada.',
      optimal: 'Gestión de Incidentes Proactiva. El equipo está preparado y aprende de cada evento.',
    },
  },
];
