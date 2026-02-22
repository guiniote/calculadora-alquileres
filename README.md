# Calculadora de Alquileres

Esta aplicación web permite a los usuarios **gestionar, calcular y previsualizar** de forma precisa actualizaciones en los montos de contratos de alquiler vigentes. Está construida usando **React + Vite** y se nutre directamente de una base de datos en **Firebase Firestore** enfocada a almacenar el histórico de contratos y sus actualizaciones.

## Características Principales

1. **Autenticación Restringida:** El acceso está mitigado usando la validación de Google Sign-in acoplada a una lista blanca de uso interno para impedir que terceros puedan registrar información.
2. **Creación de Contratos:** Permite registrar los detalles claves: la duración, el sistema de índice seleccionado (Ej. IPC o ICL), y la frecuencia estipulada de meses para actualizar la renta.
3. **Módulo de Actualización con Validaciones:**
   - Calcula el nuevo alquiler en base a la inflación fraccionada de cada mes correspondido.
   - Aplica validaciones de periodos cruzados, previniendo asentar en el sistema un periodo que ya ha sido cobrado.
   - Brinda resguardo a los primeros meses del contrato, según lo exige la frecuencia elegida, impidiendo actualizaciones prematuras.
   - Proyecta y recuerda los antiguos y nuevos depósitos de garantía pactados en caso de requerir reajustes.
4. **Módulo Administrativo:** Brinda la capacidad de editar la métrica de un contrato de forma rápida y provee un sistema de *borrado lógico* para separar a los inactivos/finalizados sin perder la data en la nube.

## Requisitos y Configuración de Uso

- **Asegurate de tener NodeJS instalado.**
- Cloná o descargá este repositorio.
- Posicionado en esta misma carpeta, instalá las dependencias corriendo: `npm install`
- Para iniciar el servidor de desarrollo, ejecutá: `npm run dev`

---
*Desarrollado para la gestión optimizada de actualizaciones de inmuebles en alquiler.*
