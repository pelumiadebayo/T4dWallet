    ### [v1.2.0] - 2024-09-28: Added
    - New Config: Set up project folder architecture.
          - The structure is as shown below:
               src
                |__wallet
                    |__services/
                    |__controllers/
                    |__interfaces/
                    |__dtos/
                    |__models/
                    |__routes
                |__transaction
                     |__services/
                    |__controllers/
                    |__interfaces/
                    |__dtos/
                    |__models/
                    |__routes
               |__server.ts
               |__package.json
               |__.env

    ### [v1.2.0] - 2024-09-28: Added
    - New Config: Set up mongoDB models using mongoose.
          - An interface was created and it extended the mongoose Document. The interface was used to create the Schema.


    ### [v1.2.0] - 2024-09-28: Added
    - New Config: Set up mongoDB connection.
          - path :- './database/connections/db.ts'


    ### [v1.2.0] - 2024-09-28: Added
    - New Config: Set up class validator
          - Added validaton function using class validator and class-transformer packages.
          - path :- './middleware/validate.ts'


    ### [v1.2.0] - 2024-09-28: Added
    - New Config: Set up nodemailer.
         - Added function for sending emails using nodemailer package.
          - path :- './utils/send-email.ts'


    ### [v1.2.0] - 2024-09-28: Added
    - New Config: Set up function for hashing passwords.
          - path :- './utils/helper-function.ts'
