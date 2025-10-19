const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/bioinformatics/analyze', (req, res) => res.json({ gene: 'BRCA1', variant: 'c.68_69delAG', risk: 0.15 }));
app.listen(3083);
