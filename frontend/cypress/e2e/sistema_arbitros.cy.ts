describe('Pruebas Funcionales de Extremo a Extremo (E2E) - Colegio de Árbitros', () => {
  
  it('Debería cargar la Landing Page correctamente y verificar elementos visuales', () => {
    // 1. Visitar tu página web ya desplegada en producción
    cy.visit('https://proyecto-arbitros-b1xi.vercel.app'); 

    // 2. Verificar que el título de la plataforma o del Colegio de Árbitros esté visible en pantalla
    cy.contains('Colegio de Árbitros').should('be.visible');
    
    // 3. Tomar una captura de pantalla automatizada para la evidencia de la tesis
    cy.screenshot('evidencia_landing_page');
  });

});