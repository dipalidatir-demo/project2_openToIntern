const InternModel = require("../model/internModel"); //Importing internmodel
const collegeModel = require("../model/collegeModel"); //Importing collegeModel
const mongoose = require("mongoose") //Importing mongoose

const { isValidEmail, isValidName, isValid, isValidMobile } = require("../validation/validator"); //Importing Validations


// Creation of College via POST /functionup/interns

const createIntern = async function (req, res) {
    try {
        let data = req.body
        let collegeId = data.collegeId

        //Checking Validation of empty Body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Body should not be empty" })
        }
        //Checking stauts of required fields-- (name,email and mobile) if all will present then code will proceed

        if (!("name" in data) || !("email" in data) || !("mobile" in data) || !("collegeId" in data))
            return res.status(400).send({ status: false, msg: "name, email,mobile, collegeId must be required" })

        //Checking presence and format of name 

        if (!isValid(data.name))
            return res.status(400).send({ status: false, msg: "The name Attributes should not be empty" })
        if (!isValidName(data.name))
            return res.status(400).send({ status: false, msg: "Pls Enter Valid Name" })

        //Checking presence, format and uniqueness of email 

        if (!isValid(data.email))
            return res.status(400).send({ status: false, msg: "The email Attributes should not be empty" })
        if (!isValidEmail(data.email))
            return res.status(400).send({ status: false, msg: "Pls Enter Valid email" })

        let checkuniqueemail = await InternModel.findOne({ email: req.body.email })
        if (checkuniqueemail) return res.status(400).send({ status: false, msg: "This email Already Exists Pls Use Another" })


        //Checking presence, validation and uniqueness of collegeId

        if (!isValid(data.collegeId))
            return res.status(400).send({ status: false, msg: "The collegeId Attributes should not be empty" })

        if (!mongoose.isValidObjectId(collegeId))
            return res.status(400).send({ status: false, msg: "The Format of college Id is invalid, Use Correct CollegeId" })

        let checkuniquecollegeId = await collegeModel.findOne({ _id: collegeId })
        if (!checkuniquecollegeId)
            return res.status(400).send({ status: false, msg: "This collegeId Does Not Exists Pls Use Another" })

        //Checking presence, uniqueness and format of Mobile number

        if (!isValid(data.mobile))
            return res.status(400).send({ status: false, msg: "The mobile Attributes should not be empty" })
        if (!isValidMobile(data.mobile))
            return res.status(400).send({ status: false, msg: "Pls Enter Valid mobile" })

        let checkuniquemobile = await InternModel.findOne({ mobile: req.body.mobile })
        if (checkuniquemobile) return res.status(400).send({ status: false, msg: "This mobile Already Exists Pls Use Another" })

        // Creating database of InternModel

        let savedData = await InternModel.create(data);
        res.status(201).send({ status: true, data: savedData });

    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }


}

//  Intern details of College via Get /functionup/collegeDetails

const getCollegeInternDetails = async function (req, res) {
    try {
        let data = req.query.name
        //Checking Validation of empty query
        if (!data)
            return res.status(400).send({ status: false, message: "Please provide data in query" })

        data.toLowerCase() 
        data=data.split(" ").join("")
        
        
        const college = await collegeModel.findOne({ name: data })

        //Checking Validation of College Presence
        if (!college) {
            return res.status(400).send({ status: false, message: "College is not found" })
        }
        const interns = await InternModel.find({ collegeId: college._id }).select({ name: 1, email: 1, mobile: 1 })

        // Handling error of No data presence in interns of requested college
        if (interns.length == 0) {
            return res.status(400).send({ status: false, message: "No interns are found in the given college" })
        }
        res.status(200).send({ status: true, "data": { "name": college.name, "fullName": college.fullName, "logoLink": college.logoLink, "interns": interns } })

    } catch (err) {

    }
}



module.exports.createIntern = createIntern
module.exports.getCollegeInternDetails = getCollegeInternDetails

//Done