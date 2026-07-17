const pool = require('../config/db');

async function createClient(req, res){
    const { companyName, contactPerson, contactEmail, contactPhone } = req.body;
   
    if(!companyName){
        return res.status(400).json({message: 'Company name is required'});
    }
    try{
        const [result]=await pool.query(
            `INSERT INTO clients(company_name, contact_person, contact_email, contact_phone) VALUES (?, ?, ?, ?)`,
            [companyName, contactPerson || null, contactEmail ||null, contactPhone ||null]
        );  
       res.status(201).json({
      id: result.insertId,
      companyName,
      contactPerson,
      contactEmail,
      contactPhone
    });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ message: 'Server error creating client' });
  }
}

// GET /api/clients — Admin and Team Member
// Lists all active clients.
async function getClients(req, res) {
  try {
    const [clients] = await pool.query(
      'SELECT id, company_name, contact_person, contact_email, contact_phone, created_at FROM clients WHERE is_active = TRUE ORDER BY company_name'
    );
    res.json(clients);
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ message: 'Server error fetching clients' });
  }
}

module.exports = { createClient, getClients };   
