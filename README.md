# Gradery

Gradery is a **learning management system** to simplify learning.  It allows students to connect with their peers and instructors. It provides an efficient classroom management system by allowing instructors to **assign assignments**, **provide resources** and **make announcements**. Gradery makes sure you dont miss out any notifications from any team.


------------


### Table of Contents   
1. [Gradery](#gradery)
2. [Contributors](#contributors)
3. [Supervisor](#supervisor)
4. [Dependencies](#dependencies)
5. [Installation](#installation)
   - [Source](#source)
   - [Database](#database)
   - [Credentials](#credentials)
   - [Node Setup](#node-setup)
6. [License](#license)

------------


### Contributors

- [1805007 - Mehbubul Hasan Al Quvi](https://github.com/quvi007)
- [1805026 - Sohaib](https://github.com/Sohaib03)


------------


### Supervisor

- [Tahmid Hasan](https://tahmid04.github.io/)

------------


### Dependencies

- NodeJS
- OracleDB (19.0.0) 


------------

### Installation
<br>
To get the project running, the following steps must be followed.

####  Source
Clone the source code from our github repository's main branch. 
``` bash
git clone https://github.com/Sohaib03/Gradery.git
```

#### Database

You need to have oracle database installed to run this project. 

+ Start SQLPlus
+ Create a new user and grant it dba permissions
+ Download the SQL Dump File. [Click Here](https://github.com/Sohaib03/Gradery/blob/main/SQLDump/dump.sql) to Download
+ Use the SQL Dump File to populate the tables


#### Credentials

The **.env** file in the source code contains the necessary HOST, USERNAME and PASSWORD required to connect to the database. Before starting the project you need to provide proper credentials in this file to connect to the database.

#### Node Setup

To install all the packages required by node, we need to run the following commands in the root directory of the project.

```bash
npm install
```
------------

#### License

This project is licensed under [Mozilla Public License 2.0](https://github.com/Sohaib03/Gradery/blob/main/LICENSE) . 
