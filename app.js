// Task1: initiate app and run server at 3000
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));

// ===== DEBUGGING MIDDLEWARE =====
app.use((req, res, next) => {
    console.log(`📨 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log('   Request Body:', req.body);
    }
    next();
});
// ================================

// Task2: create mongoDB connection 
mongoose.connect('mongodb+srv://gauri224060:voihewzfMIymWrtO@cluster0.gf8u0ug.mongodb.net/employeeDB?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Employee Schema
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    position: { type: String, required: true },
    salary: { type: Number, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below

//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', async (req, res) => {
    try {
        console.log('🔍 Fetching all employees...');
        const employees = await Employee.find();
        console.log(`✅ Found ${employees.length} employees`);
        res.json(employees);
    } catch (error) {
        console.error('❌ Error fetching employees:', error);
        res.status(500).json({ message: error.message });
    }
});

//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        console.log(`🔍 Fetching employee with ID: ${req.params.id}`);
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            console.log('❌ Employee not found');
            return res.status(404).json({ message: 'Employee not found' });
        }
        console.log(`✅ Found employee: ${employee.name}`);
        res.json(employee);
    } catch (error) {
        console.error('❌ Error fetching employee:', error);
        res.status(500).json({ message: error.message });
    }
});

//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', async (req, res) => {
    try {
        console.log('➕ Creating new employee...');
        const { name, location, position, salary } = req.body;
        
        if (!name || !location || !position || !salary) {
            console.log('❌ Missing fields in request');
            return res.status(400).json({ message: 'All fields are required' });
        }

        const employee = new Employee({
            name,
            location,
            position,
            salary: Number(salary)
        });
        
        const savedEmployee = await employee.save();
        console.log(`✅ Employee created: ${savedEmployee.name} (ID: ${savedEmployee._id})`);
        res.status(201).json(savedEmployee);
    } catch (error) {
        console.error('❌ Error creating employee:', error);
        res.status(500).json({ message: error.message });
    }
});

// Handle PUT without ID (frontend compatibility)
app.put('/api/employeelist', async (req, res) => {
    try {
        console.log('✏️ UPDATE request received:', req.body);
        
        const { _id, id, name, location, position, salary } = req.body;
        const employeeId = _id || id;
        
        console.log(`🔧 Processing update for ID: ${employeeId}`);
        
        if (!employeeId) {
            console.log('❌ No employee ID provided');
            return res.status(400).json({ 
                message: 'Employee ID is required',
                receivedBody: req.body 
            });
        }

        if (!name || !location || !position || !salary) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                message: 'All fields are required'
            });
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { name, location, position, salary: Number(salary) },
            { new: true, runValidators: true }
        );
        
        if (!updatedEmployee) {
            console.log('❌ Employee not found in database');
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        console.log(`✅ Employee updated: ${updatedEmployee.name}`);
        res.json(updatedEmployee);
        
    } catch (error) {
        console.error('❌ Error updating employee:', error);
        res.status(500).json({ 
            message: error.message,
            errorType: error.name 
        });
    }
});

//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        console.log(`🗑️ Deleting employee with ID: ${req.params.id}`);
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            console.log('❌ Employee not found for deletion');
            return res.status(404).json({ message: 'Employee not found' });
        }
        console.log(`✅ Employee deleted: ${deletedEmployee.name}`);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting employee:', error);
        res.status(500).json({ message: error.message });
    }
});

// Handle DELETE without ID (frontend compatibility)
app.delete('/api/employeelist', async (req, res) => {
    try {
        console.log('🗑️ DELETE request received:', req.body);
        const { _id } = req.body;
        
        if (!_id) {
            console.log('❌ No ID provided for deletion');
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        const deletedEmployee = await Employee.findByIdAndDelete(_id);
        if (!deletedEmployee) {
            console.log('❌ Employee not found for deletion');
            return res.status(404).json({ message: 'Employee not found' });
        }
        console.log(`✅ Employee deleted: ${deletedEmployee.name}`);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting employee:', error);
        res.status(500).json({ message: error.message });
    }
});

//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put('/api/employeelist/:id', async (req, res) => {
    try {
        console.log(`✏️ Updating employee with ID: ${req.params.id}`);
        const { name, location, position, salary } = req.body;
        
        if (!name || !location || !position || !salary) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { name, location, position, salary: Number(salary) },
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            console.log('❌ Employee not found');
            return res.status(404).json({ message: 'Employee not found' });
        }

        console.log(`✅ Employee updated: ${updatedEmployee.name}`);
        res.json(updatedEmployee);
    } catch (error) {
        console.error('❌ Error updating employee:', error);
        res.status(500).json({ message: error.message });
    }
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

app.listen(3000, () => {
    console.log('🚀 Server started on port 3000');
    console.log('📊 Frontend: http://localhost:3000/');
    console.log('🔗 API Health: http://localhost:3000/api/employeelist');
});