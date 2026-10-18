# Optimizador Fiscal Chile

Planificador tributario y financiero para empresas chilenas (pymes y empresas medianas).

## Características

- ✅ 100% procesamiento en el navegador (privacidad total)
- 📊 Cálculo de IVA, Renta (Primera Categoría) e impuestos de los dueños
- 🔄 Comparación de regímenes tributarios (General, Pro Pyme General, Pro Pyme Transparente)
- 📈 Escenarios de proyección (conservador, base, optimista)
- 💡 Recomendaciones personalizadas de planificación tributaria legal
- 📅 Proyección de flujo de caja tributario a 12 meses
- ⚖️ Checklist de gobierno corporativo y cumplimiento

## Instalación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

```bash
npm run build
```

El proyecto está listo para desplegarse en Vercel sin configuración adicional.

## Valores a Verificar

Antes de confiar en los resultados, verifica en **config_chile.json** estos valores en [sii.cl](https://www.sii.cl):

- Valor UF, UTM y UTA vigentes
- Tasas de impuestos (IVA, Primera Categoría por régimen, Global Complementario, Adicional)
- Límites Pro Pyme (actualmente 85.000 UF)
- Tramos del Impuesto Global Complementario

## Licencia

MIT - Solo para fines educativos. No constituye asesoría tributaria, contable ni legal.
