const dotenv = require("dotenv");
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection

const uri = process.env.MONGO_URI;

// const uri = "mongodb://localhost:27017"

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    await client.connect();

    // await client.db("admin").command({ ping: 1 });
    // Access the database and collections

    const db = client.db("job_seeker");
    const userCollection = db.collection("user");
    const jobCollection = db.collection("job");
    const jobApplicationCollection = db.collection("jobApplications");

    console.log("Successfully connected to MongoDB!");




// ________________________________my posted job api 



    app.get("/jobs/:email", async (req, res) => {
      try {
        const email = req.params.email; 
        const result = await jobCollection.find({ addJobOwnerEmail: email }).toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message }); // Proper error handling
      }
    });
    
    
    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await jobCollection.deleteOne({ _id: new ObjectId(id) });
        if (!result) {
          return res.status(404).json({ message: "result not found" });
        }
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: "Error fetching result details" });
      }
    });




    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id; 
      console.log("Job ID: ", id);
      
      // Check if the provided ID is a valid ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
    
      const query = { _id: new ObjectId(id) }; 
      const data = req.body; 
      
      try {
      
        const result = await jobCollection.updateOne(query, { $set: data });
    
      
        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: "Job not found or no changes made" });
        }
    
       
        res.status(200).json({ message: "Job updated successfully", result });
      } catch (error) {
        // Send error response if something goes wrong during the database operation
        console.error("Error updating job:", error); // Log the error for debugging
        res.status(500).json({ message: "Error updating job", error: error.message });
      }
    });



    app.get("/jobs", async (req, res) => {
      try {
        const result = await jobCollection.find().limit(6).toArray();
        res.json(result);
      } catch (error) {
        res.json(error);
      }
    });

    app.get("/allJob", async (req, res) => {
      try {
        const result = await jobCollection.find().toArray();
        res.json(result);
      } catch (error) {
        res.json(error);
      }
    });

    // app.post("/jobs", async (req, res)=>{
    // try {
    //   const result = await jobCollection.insertMany(jobsData);
    //   res.json(result);
    // } catch (error) {
    //   res.json(error);
    // }
    // })

    app.get("/jobDetails/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await jobCollection.findOne({ _id: new ObjectId(id) });
        if (!result) {
          return res.status(404).json({ message: "result not found" });
        }
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: "Error fetching result details" });
      }
    });




    // job application api

    app.post("/job-applications", async (req, res) => {
      try {
        const data = req.body;
        const result = await jobApplicationCollection.insertOne(data);

        if (result.acknowledged) {
          res
            .status(200)
            .json({ success: true, message: "result added successfully" });
          console.log(result);
        } else {
          res
            .status(500)
            .json({ success: false, message: "Failed to add result" });
        }
      } catch (err) {
        console.error("Error inserting result:", err);
        res
          .status(500)
          .json({ message: "Failed to add result", error: err.message });
      }
    });

    app.get("/applied-job/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { applicantEmail: email };
      try {
        const result = await jobApplicationCollection
          .find({ applicantEmail: email })
          .toArray();

        for (const item of result) {
          const job = await jobCollection.findOne({
            _id: new ObjectId(item.jobId),
          });
          if (job) {
            item.jobTitle = job.title;
            item.companyName = job.company;
            item.location = job.location;
            item.company_logo = job.company_logo;
          }
        }

        if (!result) {
          return res.status(404).json({ message: "result not found" });
        }
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: "Error fetching result details" });
      }
    });

    app.delete("/applied-job/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      try {
        const result = await jobApplicationCollection.deleteOne(query);

        if (!result) {
          return res.status(404).json({ message: "result not found" });
        }
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: "Error fetching result details" });
      }
    });

    // add new job

    app.post("/addJob", async (req, res) => {
      try {
        const data = req.body;
        const result = await jobCollection.insertOne(data);

        if (result.acknowledged) {
          res
            .status(200)
            .json({ success: true, message: "result added successfully" });
          console.log(result);
        } else {
          res
            .status(500)
            .json({ success: false, message: "Failed to add result" });
        }
      } catch (err) {
        console.error("Error inserting result:", err);
        res
          .status(500)
          .json({ message: "Failed to add result", error: err.message });
      }
    });
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  } finally {
    // await client.close();
  }
}






// app.get("/allJob", async (req, res) => {
//   try {
//     const result = await jobCollection.find().toArray();
//     res.json(result);
//   } catch (error) {
//     res.json(error);
//   }
// });





run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Server is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
