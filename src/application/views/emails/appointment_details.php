<html>
<head>
    <title>Appointment Details</title>
</head>
<body style="font: 13px arial, helvetica, tahoma;">
    <div class="email-container" style="width: 650px;border: 1px solid #eee;">
        <div id="header" style="background-color: #3DD481; border-bottom: 4px solid #1A865F; 
                height: 40px;padding: 10px 15px;">
            <strong id="logo" style="color: white; font-size: 24px; 
                    text-shadow: 1px 1px 1px #8F8888; margin-top: 5px; display: inline-block">
                    $company_name</strong>
        </div>

        <div id="content" style="padding: 10px 15px;">
            <h2>$email_title</h2>
            <p>
Hi $customer_name,
</p>
<p>
Thank you for arranging a $appointment_service with $appointment_provider on $appointment_long_date at $appointment_time. Below you can see the appointment details. Make changes by clicking the appointment link.
</p>    
<p>
Please note: If your appointment time is after 6pm or on a Saturday, the main doors into the Atrium will be locked. Please enter the building through Habit Coffee on the corner of Yates and Blanshard and wait by the elevators on the ground floor. Your therapist will come down to bring you up.
</p>

<p>
If you have any issues finding us, please call or text your therapist. 
</p>
<p>
Wellness At The Atrium<br/>
1321 Blanshard Street, Suite 301 on the 3rd floor. </p>
<p>
Alix Morrison, RMT: (250) 857-8969<br/>
Tara Tait, RMT: (250) 882-7713
</p>    
            
            <h2>Appointment Details</h2>
            <table id="appointment-details">
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">Service</td>
                    <td style="padding: 3px;">$appointment_service</td>
                </tr>
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">Provider</td>
                    <td style="padding: 3px;">$appointment_provider</td>
                </tr>
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">Start</td>
                    <td style="padding: 3px;">$appointment_start_date</td>
                </tr>
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">End</td>
                    <td style="padding: 3px;">$appointment_end_date</td>
                </tr>
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">Notes</td>
                    <td style="padding: 3px;">$appointment_notes</td>
                </tr>
            </table>
            
            <h2>Customer Details</h2>
            <table id="customer-details">
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">Name</td>
                    <td style="padding: 3px;">$customer_name</td>
                </tr>
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">Email</td>
                    <td style="padding: 3px;">$customer_email</td>
                </tr>
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">Phone</td>
                    <td style="padding: 3px;">$customer_phone</td>
                </tr>
                <tr>
                    <td class="label" style="padding: 3px;font-weight: bold;">Address</td>
                    <td style="padding: 3px;">$customer_address</td>
                </tr>
            </table>
            
            <h2>Appointment Link</h2>
            <a href="$appointment_link" style="width: 600px;">$appointment_link</a>
        </div>

        <div id="footer" style="padding: 10px; text-align: center; 
                border-top: 1px solid #EEE;background: #FAFAFA;">
            <a href="$company_link">$company_name</a> | Powered by Easy!Appointments        
        </div>
    </div>
</body>
</html>
