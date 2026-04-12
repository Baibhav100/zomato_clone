describe('Home Page', () => {
  it('should load the Zomato clone and check for header', () => {
    cy.visit('http://localhost:3000');
    cy.contains('zomato').should('be.visible');
    cy.contains('Guwahati').should('be.visible');
  });

  it('should switch tabs', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Dining Out').click();
    cy.url().should('include', '/dine-out');
  });
});
