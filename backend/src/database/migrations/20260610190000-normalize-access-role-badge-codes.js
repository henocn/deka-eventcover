'use strict';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateBadgeCode(existingCodes) {
  while (true) {
    const code = Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }
}

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query('SELECT id, public_token FROM access_roles');
    const existingCodes = new Set(
      roles
        .map((role) => String(role.public_token || '').toUpperCase())
        .filter((code) => /^[A-Z0-9]{6}$/.test(code))
    );

    for (const role of roles) {
      const currentCode = String(role.public_token || '').toUpperCase();
      const nextCode = /^[A-Z0-9]{6}$/.test(currentCode)
        ? currentCode
        : generateBadgeCode(existingCodes);

      if (nextCode !== role.public_token) {
        await queryInterface.sequelize.query(
          'UPDATE access_roles SET public_token = :code, updated_at = NOW() WHERE id = :id',
          {
            replacements: {
              code: nextCode,
              id: role.id,
            },
          }
        );
      }
    }
  },

  async down() {
    // Irreversible: old long public tokens cannot be restored safely.
  },
};
