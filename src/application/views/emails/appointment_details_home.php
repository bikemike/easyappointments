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
Thank you for booking a $appointment_service with $appointment_provider on $appointment_long_date at $appointment_time. Below you can see the appointment details. Make changes by clicking the appointment link.
</p>
<p>
Should an appointment be missed without notice, the full appointment fee will apply.
</p>
<p>
Please read through my updated <a href="/covid-19-policy">Covid-19 policy</a>: 
</p>

<ul>
<li>For your comfort and safety, I will be wearing a mask and if you have a mask, you can bring it with you or one may be provided.</li>
<li>There will be a 15 minutes buffer between appointments.</li>
<li>Please come on time for your appointment - no more than 5 minutes early.</li>
<li>I have removed all porous materials from the treatment room to allow for thorough cleaning - no clutter here! </li>
<li>Hand sanitizer will be located at the entrance. Please sanitize your hands upon arrival at the clinic.</li>
<li>Common areas will be cleaned regularly throughout the day.</li>
<li>I will self-check my own health before coming to work and will cancel all appointments if unwell.</li>
<li>We will need to reschedule your appointment if you are experiencing fever, cough or any flu/cold-like symptoms or are feeling unwell; you have been in close contact with someone experiencing these symptoms in the last 14 days; or if you have taken a flight in the last 14 days.</li>
<li>Please come to your appointment on your own. Anyone accompanying you will be asked to wait outside until your appointment has finished. Please make arrangements for childcare, as no additional people will be permitted to accompany patients into the clinic.</li>
<li>Please refrain from touching your face. If you need to cough or sneeze, please do so in a tissue or in your sleeve at the elbow, and sanitize your hands immediately after.</li>
<li>Please limit the number of belongings you bring to the clinic and come prepared with or wearing the clothing necessary for treatment.</li>
<li>I appreciate your patience and understanding in these challenging times. Thank you! We're in this together!</li>
</ul>

<p>
Alix Morrison, RMT: (250) 857-8969<br/>
<br/>
46 Degoutiere Place, Victoria BC<br/>
<br/>
Please park in the driveway and knock at the front door.
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
