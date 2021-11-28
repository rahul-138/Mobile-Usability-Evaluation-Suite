const mongoose = require('mongoose');
const PORT = 8080;
const express = require('express');
const ejs = require('ejs');

const PDFDocument = require('pdfkit');
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
const os = require('os')
const fs = require('fs')

var path = require('path');
var bodyParser = require('body-parser');

mongoose.connect("mongodb+srv://m001-student:L4aXf6t2pk2fhmrv@cluster0.p2iii.mongodb.net/mobile_usability_suiteDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//app.use(bodyparser.urlencoded({extended:true}));
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", ejs);
const participantSchema = new mongoose.Schema({
    Name: String,
    Gender: String,
    Email: String,
    Date: String,
    Time: String,
    Phone: Number,
    Tasks: Array,
    Notes:String
});
const Participant = mongoose.model('Participant', participantSchema);
app.post('/addParticipant', function (req, res) {
    let task_arr = [];
    if (req.body.hidden)
        task_arr = JSON.parse(req.body.hidden)
    console.log(task_arr)

    const silence = new Participant({
        Name: req.body.name, Gender: req.body.gender, Email: req.body.email, Date: req.body.date, Time: req.body.time, Phone: req.body.phone,
        Tasks: task_arr
    }
    );
    silence.save();
    res.redirect("/");
});
app.get("/", function (req, res) {
    res.render("index.ejs");
});
app.get("/review/:participant_name/:obj_id/:task/:task_id", function (req, res) {
    let participant_name = req.params.participant_name
    let task_name = req.params.task
    let task_id = req.params.task_id
    let obj_id = req.params.obj_id
    res.render("review.ejs", {
        participant_name: participant_name,
        task_name: task_name,
        task_id: task_id,
        obj_id: obj_id
    });
});
app.get("/register", function (req, res) {
    res.render("register.ejs");
});
app.get("/record/:participant_name/:obj_id/:task/:task_id", function (req, res) {
    let participant_name = req.params.participant_name
    let task_name = req.params.task
    let task_id = req.params.task_id
    let obj_id = req.params.obj_id
    res.render("record.ejs", {
        participant_name: participant_name,
        task_name: task_name,
        task_id: task_id,
        obj_id: obj_id
    });
});

app.get("/generatepdf/:obj_id/:index", function(req,res){
    var id = mongoose.Types.ObjectId(req.params.obj_id);
    
    Participant.findOne({_id:id},function(err,results){
        if(!err)
        {
            const doc = new PDFDocument();
            
            let taskname;
            let tasknotes;
            let index=req.params.index;
            let participant_name=results.Name;
            let pname="Participant name: "+ participant_name 
            let filename="./review_notes/"+participant_name+index+"_Notes.pdf"
            let datetime=results.Date+" ("+results.Time+")";
    
            doc.pipe(fs.createWriteStream(filename));
            doc.fontSize(25).font('Helvetica-Bold').text('Mobile Usability Evaluation Review Notes\n',{align: 'center'})
            
            doc.moveTo(doc.x,doc.y).lineTo(doc.page.width-80,doc.y).stroke();
            doc.moveDown();
            doc.fontSize(18).fillColor('black').text("Participant name: ",{lineGap:5,continued: true}).fillColor('blue').text(participant_name);
            doc.fontSize(18).fillColor('black').text("Email id: ",{lineGap:5,continued: true}).fillColor('blue').text(results.Email);
            doc.fontSize(18).fillColor('black').text("Phone number: ",{lineGap:5,continued: true}).fillColor('blue').text(results.Phone);
            doc.fontSize(18).fillColor('black').text("Date and time of evaluation: ",{continued: true}).fillColor('blue').text(datetime);
            doc.moveTo(doc.x,doc.y).lineTo(doc.page.width-80,doc.y).stroke();
            doc.moveDown();
            arr = results.Tasks;
            arr.forEach(function(task,i){

                tasks=task.split(',');
                taskname= task.split(',')[0]
                tasknotes= task.split(',')[1]

                if(tasknotes==null){
                    tasknotes="No notes available for this task";
                }
                else{
                    for (let i = 2; i < tasks.length; i++) {
                        tasknotes+=tasks[i]+'\n';
                    }
                }
                
                doc.fontSize(18).fillColor('black').font('Helvetica-Bold').text("Task Name: ",{lineGap:6,continued: true}).fillColor('blue').text(taskname);
                
                doc.fontSize(14).fillColor('black').font('Helvetica').text(tasknotes);
                
                doc.moveTo(doc.x,doc.y).lineTo(doc.page.width-80,doc.y).stroke();
                doc.moveDown();
            });
            
            //console.log(results);
            doc.end();
            //console.log("PDF created");
            res.redirect("/participants");
        }
        
    });
});


app.get("/participants", function (req, res) {
    Participant.find({}, function (err, results) {
        if (!err) {
            let obj_array=[];
            results.forEach(function(doc,i){
                
                obj_array[i]=doc._id.toString();
            });
            console.log(obj_array);
            res.render("participants.ejs", {
                obj_array:obj_array,
                participant_list: results
            })
        }
        else {
            console.log(err);
        }
    });

});
app.post("/", function (req, res) {
    const n1 = req.body.n1;
    console.log(n1);
});

app.post('/uploadvideo/:obj_id/:id', multipartMiddleware, function (req, res) {
    
    let fileName = req.params.obj_id + '_' + req.params.id + '.webm'
    
    let location = path.join(__dirname + '/public/recordings', fileName)
    fs.rename(req.files.data.path, location, function (err) {
        if (err) console.log('ERROR: ' + err);
    });
});

app.post('/addNotes/:obj_id/:id',function(req,res){
    let note=req.body.notes;
    let obj_id=mongoose.Types.ObjectId(req.params.obj_id);
    let index=req.params.id;
    let arr;
    Participant.findOne({_id:obj_id},function(err,results){
        if(!err)
        {
            arr=results.Tasks;
            arr[index]=arr[index]+","+note;
            console.log(arr);
            let filter={_id:obj_id}
            let updateTask={Tasks:arr}
            
            Participant.findOneAndUpdate(filter,updateTask,function(err,results){
                if(!err)
                {
                    res.redirect("/participants");
                }
            });
            
        }
    }); 
});
app.listen(process.env.PORT || 3000, function () {
    console.log("Server running");
});