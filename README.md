Easy!Appointments
================

<img src="https://dl.dropboxusercontent.com/u/27545985/easyappointments/google-code-banner.png">

## Organize your business! Exploit human resources that can be used in other tasks more efficiently.

**Easy!Appointments** is a highly customizable web application that allows your customers to book 
appointments with you via the web. Moreover, it provides the ability to sync your data with 
Google Calendar so you can use them with other services. It is an open source project and you 
can download and install it **even for commercial use**. Easy!Appointments will run smoothly with 
your existing website, because it can be installed in a single folder of the server and of course, 
both sites can share the same database.

### Features
The project was designed to be flexible and reliable so as to be able to meet the needs of any 
kind of enterprise. You can the read the main features of the system below:

* Full customers and appointments management.
* Services and service providers organization.
* Work flow and booking rules.
* Google Calendar synchronization.
* Email notifications system.
* Stand alone installation (like WordPress, Joomla! and other web systems).

### Installation
Since Easy!Appointments is a web application, it runs on a web server and thus you will need to 
perform the following steps in order to install the system on your server:

* Make sure that your server has Apache, PHP and MySQL installed.
* Create a new database (or use an existing).
* Copy the "easyappointments" source folder on your server.
* Edit the "configuration.php" file and set your server properties.
* Open your browser on the Easy!Appointments URL and follow the installation guide.
* That's it! You can now use Easy!Appointments at your will.
* Reminders can be sent out 24 hours before the appointment by setting up a cron job. The cron job will check for upcoming appointments and send a reminder notification if one has not been sent. The cronjob should run the following command:
```
php index.php cli send_appointment_reminders
```

You will find the latest release at [easyappointments.org](http://easyappointments.org). If you have problems installing or configuring the application take a look on the [Wiki Pages](https://github.com/alextselegidis/easyappointments/wiki) or visit the [Official Support Group](https://groups.google.com/forum/#!forum/easy-appointments). You can also report problems on the [Issues Page](https://github.com/alextselegidis/easyappointments/issues) in order to help the development progress or contact [alextselegidis@gmail.com](mailto:alextselegidis@gmail.com).


### Upgrading
To make sure the database schema is up to date, run the following command:
```
php index.php cli update
```

### User Feedback
Whether it is new ideas or defects, your feedback is highly appreciated and will be taken into 
consideration for the following releases of the project. Share your experience and discuss your 
thoughts with other users through communities. Create issues with suggestions on new features or 
bug reports. Please take your time to fill this quick [Feedback Form] (https://docs.google.com/forms/d/15dw1jl7lUgw4q-XXMn13Gx_e8zJxAiyWYMOdqtZqIHU/viewform#start=openform) about the project. You can also submit new feature requests on the [Feature Request Page]
(http://easyappointments.org/submission.php).

### Translate E!A
As of version 1.0 Easy!Appointments supports translated user interface. If you want to contribute to the 
translation process contact [alextselegidis@gmail.com](mailto:alextselegidis@gmail.com).
