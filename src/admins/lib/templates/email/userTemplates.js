export const completeKyc = () => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hello SeedFi user,
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>Kindly login to SeedFi app to complete your profile, verify your bvn and upload valid id to enjoy great benefits.</p>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>You can ignore this if you have done all of this</p>
        </td>
    </tr>
    <tr>
        <td>
          <span style="line-height: 40px">Thanks</span> <br />
          <span style="line-height: 40px">Yours Credibly</span> <br />
          <span style="font-weight: 600; display: block;">SeedFi</span>
          <span style="display: block;">Email: ask@seedfi.com</span>
          <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;

export const sendLoanApprovalMail = (data) => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hello ${data.first_name},
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>Your loan application of ₦${parseFloat(data.requested_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} has been approved.<br /> 
            Kindly login to the application to complete loan disbursement.</p>
        </td>
    </tr>
    <tr>
        <td>
          <span style="line-height: 40px">Thanks</span> <br />
          <span style="line-height: 40px">Yours Credibly</span> <br />
          <span style="font-weight: 600; display: block;">SeedFi</span>
          <span style="display: block;">Email: ask@seedfi.com</span>
          <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;

export const sendLoanDisapprovalMail = (data) => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hello ${data.first_name},
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>Your loan application of ₦${parseFloat(data.requested_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} has been declined.<br /> 
            Kindly login to try again or reach out to our support team.</p>
        </td>
    </tr>
    <tr>
        <td>
          <span style="line-height: 40px">Thanks</span> <br />
          <span style="line-height: 40px">Yours Credibly</span> <br />
          <span style="font-weight: 600; display: block;">SeedFi</span>
          <span style="display: block;">Email: ask@seedfi.com</span>
          <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;
export const utilityBillDeclinedMail = (data) => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hello ${data.first_name},
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>Your utility bill submission has been declined. <br /> 
        Please login upload your utility bill again.
        </td>
    </tr>
    <tr>
        <td>
          <span style="line-height: 40px">Thanks</span> <br />
          <span style="line-height: 40px">Yours Credibly</span> <br />
          <span style="font-weight: 600; display: block;">SeedFi</span>
          <span style="display: block;">Email: ask@seedfi.com</span>
          <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;

export const utilityBillApprovalMail = (data) => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hello ${data.first_name},
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>The utility bill you supplied has been accepted.<br />
         Please sign in to continue with your loan activity.</p>
        </td>
    </tr>
    <tr>
        <td>
          <span style="line-height: 40px">Thanks</span> <br />
          <span style="line-height: 40px">Yours Credibly</span> <br />
          <span style="font-weight: 600; display: block;">SeedFi</span>
          <span style="display: block;">Email: ask@seedfi.com</span>
          <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;

export const adminClusterInvite = (data) => `
 <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
    <td>
        <p>
        You have been invited to join a cluster.
        </p>       
    </td>
    <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
        <td style="padding-bottom: 20px">
            <p>
            SeedFi admin is inviting you to join ${data.cluster_name} Cluster loan group<br/>
            Kindly Kindly click <a href="${data.join_url}">here</a> to join cluster.
            </p>  
        </td>
    </tr>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
<td>
  <span style="line-height: 40px">Yours Credibly</span> <br />
  <span style="font-weight: 600; display: block;">SeedFi</span>
  <span style="display: block;">Email: ask@seedfi.com</span>
  <span style="display: block;">Call: +234 814 650 7035</span>
</td>
</tr>
`;
