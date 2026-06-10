const fieldLabels = {
  'body.title': 'Titre',
  'body.description': 'Description',
  'body.location': 'Lieu',
  'body.startsAt': 'Date de debut',
  'body.endsAt': 'Date de fin',
  'body.accessCode': "Code d'acces",
  'body.isPublished': 'Publication',
  'body.email': 'Email',
  'body.password': 'Mot de passe',
  'body.fullName': 'Nom',
  'body.role': 'Role',
  'body.isActive': 'Statut',
  'params.eventId': 'Evenement',
  'params.albumId': 'Album',
  'params.mediaId': 'Media',
  'params.userId': 'Utilisateur',
};

function formatIssue(issue) {
  const path = issue.path.join('.');
  const label = fieldLabels[path] || path || 'Requete';

  return {
    field: path,
    label,
    message: `${label}: ${issue.message}`,
  };
}

module.exports = function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = result.error.issues.map(formatIssue);

      return res.status(400).json({
        message: 'Certaines informations sont invalides.',
        errors,
      });
    }

    req.validated = result.data;
    return next();
  };
};
