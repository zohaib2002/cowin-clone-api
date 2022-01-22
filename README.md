# CoWIN API

## API Features

CoWIN API provides API endpoints for all the components involved in a Covid-19 vaccination service.

- ### CoWIN Website
  - Create and Register new beneficiaries
  - Book / View Appointments for users
  - Notify users if thier appointment is expired
- ### Administration
  - Create / Update / View / Delete Vaccination centers
  - Maintain number of slots available per day for each center
  - Get all Cneters in a given city
  - Cancel appointments for users
  - Remove beneficiaries
- ### Vaccination Center
  - Get all appointments by center
  - Complete appointments (updates doses taken for user)

## API Index

### Users

- [x] Generate OTP
- [x] Validate OTP
- [x] Register User
- [x] Delete User

### Centers

- [x] Create a Center
- [x] Update a Center
- [x] Delete a Center
- [x] Get Center by its ID
- [x] Get all Centers in a city

### Appointments

- [x] Book an Appointment
- [x] Complete an Appointment
- [x] Cancel an Appointment
- [x] Get an Appointment by its ID
- [x] Get all appointments in a Center

### Miscellaneous

- [x] Get all Indian States
- [x] Get Cities in a State

## Feel free to contribute!

**Read Documentation:** https://tiny.cc/apidocs  
This API is hosted on Heroku: https://cowin-clone-api.herokuapp.com/  
MongoDB database is hosted on MongoDB Atlas (Shared) (M0 Sandbox)

This is a part of GeoGo Techsolutions FullStack Internship Program Project.
