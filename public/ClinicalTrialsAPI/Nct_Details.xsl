<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  version="1.0">
  <xsl:template match="/">
	<div class="results-summary">
      <h1 class="rsTitle"><xsl:value-of select="clinical_study/brief_title" /></h1>
       <div class="cont_wrapper">
        <div class="floater-50 f_left cont1 " id="trial-info-1">        
          
		  <div class="recruiting-status">		   
		         This study is currently recruiting participants.
		                   <font color="black"> (see </font> <span><a href="#Contact">Contacts and Locations</a></span><font color="black">)</font>		             
		  </div>		           
		  <div title="The verification date is the most recent date the responsible party verified the study information is correct.  The last updated date is the most recent date the record changed in any way.  The two dates may be different." class="status-details">
		         <span style="color: #0000cc;">Verified  <xsl:value-of select="clinical_study/verification_date" /></span> by <xsl:value-of select="clinical_study/sponsors/lead_sponsor/agency" />
		  </div>                 
		  <div class="info-title">
		   Sponsor:
		  </div>
		  <div class="info-text" id="sponsor">
		    <xsl:value-of select="clinical_study/sponsors/lead_sponsor/agency" />
		  </div>
		  <div class="info-title">
		   Information provided by (Responsible Party):
		  </div>                
		  <div class="info-text">
		   <xsl:value-of select="clinical_study/sponsors/lead_sponsor/agency" />
		  </div>	  		              
		 </div>               
		 
		 <div class="floater-50 f_right cont2" id="trial-info-2">
		  <div class="info-title">
		   ClinicalTrials.gov Identifier:
		  </div>          
		  <div class="identifier">
		   <xsl:value-of select="clinical_study/id_info/nct_id" />
		  </div>          
		  <div class="info-date">
		   First received: <xsl:value-of select="clinical_study/firstreceived_date" />
		  </div>          
		  <div class="info-date">
		   Last updated:  <xsl:value-of select="clinical_study/lastchanged_date" />
		  </div>          
		  <div class="info-date">
		   Last verified:  <xsl:value-of select="clinical_study/verification_date" />
		  </div>  
		  <div class="info-date">
		    <span>History of Changes</span> 
		  </div>               
		</div>
	  </div>

	  	<!-- <div class="clinical-tabs">
    <ul class="clinical-tab-links">
        <li class="active"><a href="#tab1">Tab #1</a></li>
        <li><a href="#tab2">Tab #2</a></li>
        <li><a href="#tab3">Tab #3</a></li>
        <li><a href="#tab4">Tab #4</a></li>
    </ul>
 
    <div class="clinical-tab-content">
        <div id="tab1" class="clinical-tab active">
            <p>Tab #1 content goes here!</p>
        </div>
 
        <div id="tab2" class="clinical-tab">
            <p>Tab #2 content goes here!</p>
        </div>
 
        <div id="tab3" class="clinical-tab">
            <p>Tab #3 content goes here!</p>
        </div>
 
        <div id="tab4" class="clinical-tab">
            <p>Tab #4 content goes here!</p>
        </div>
    </div>
</div> -->



<div class="clinical-tabs">
    <ul class="clinical-tab-links">
        <li class="active"><a href="#tab1">Full Text View</a></li>
        <li><a href="#tab2">Tabular View</a></li>
    </ul>
 
    <div class="clinical-tab-content">
        <div id="tab1" class="clinical-tab active FullTextView">

        	


        	<div>  <!-- Purpose section -->

			  <xsl:for-each select="clinical_study">
				<div class="nctSection purposeSection">
					<h3 class="purposeheader">Purpose</h3>
					<span><xsl:value-of select="brief_summary/textblock" /></span>
					<div align="center">
					<table class="sectionInnerTable" cellspacing="0" cellpadding="5" border="1" width="80%" >
						<tr class="title-row">
							<th>Condition</th>
							<th>Intervention</th>
						</tr>
						<tr>
							<td><xsl:value-of select="condition" /></td>
							<td><xsl:value-of select="intervention/intervention_type" /> : <xsl:value-of select="intervention/intervention_name" /></td>
						</tr>
					</table>
				</div>
					<span>Study Type: <xsl:value-of select="study_type" /></span><br/>
					<span>Study Design: <xsl:value-of select="study_design" /></span><br/>
					<span>Official Title: <xsl:value-of select="official_title" /></span><br/>
					
					<span class="outcomesMeasure">
						<p class="nctSubheading">Further study details as provided by Gilead Sciences:</p>
						<p>Primary Outcome Measures:</p>
						<ul>
							<xsl:for-each select="primary_outcome">
								<li><xsl:value-of select="measure" />  
									[ Time Frame: <xsl:value-of select="time_frame" /> ]
									[ Designated as safety issue: <xsl:value-of select="safety_issue" /> ]
								</li>
							</xsl:for-each>
						</ul>
						<p>Secondary Outcome Measures:</p>
						<ul>
							<xsl:for-each select="secondary_outcome">
								<li><xsl:value-of select="measure" />  
									[ Time Frame: <xsl:value-of select="time_frame" /> ]
									[ Designated as safety issue: <xsl:value-of select="safety_issue" /> ] <br/>
									<xsl:value-of select="description" />
								</li>
							</xsl:for-each>
						</ul>
					</span>
					
						<span>
							<p>Biospecimen Retention: <xsl:value-of select="biospec_retention" /> <br/>
								<xsl:value-of select="biospec_descr/textblock" /></p>
							<ul>
								<li>Estimated Enrollment: <xsl:value-of select="enrollment" /></li> 
								<li>Study Start Date: <xsl:value-of select="start_date" /></li>
								<li>Estimated Study Completion Date: <xsl:value-of select="completion_date" /></li>
								<li>Estimated Primary Completion Date: <xsl:value-of select="primary_completion_date" /> (Final data collection date for primary outcome measure)</li>
							</ul>
						</span>
						
						<div class="arm_group">
							<span class="groupHeader">
								<span>Groups/Cohorts</span>
								<span>Assigned Interventions</span>
							</span>
							<div class="groupsSection">
								<xsl:for-each select="arm_group">
									<span>
										<xsl:value-of select="arm_group_type" />
										<xsl:value-of select="arm_group_label" /><br/>
										<xsl:value-of select="description" />
									</span>
								</xsl:for-each>
							</div>
							<div class="interventionsSection">
								<xsl:for-each select="intervention">
									<span>
										<xsl:value-of select="intervention_type" /> : 
											<xsl:value-of select="intervention_name" />
											<xsl:value-of select="description" /> <br/>
											<span>Other Names: </span> <br/>
											<ul>
												<!--xsl:for-each select="other_name"-->
													<li><xsl:value-of select="other_name" /></li>
												<!--/xsl:for-each-->
											</ul>
									</span>
								</xsl:for-each>
							</div>
						</div>
					
					</div >
					<!--end of purpose section -->
					
					<!-- Eligibility section -->
					<div class="nctSection eligibilitySection">
						<h3>Eligibility</h3>
						<xsl:for-each select="eligibility">
							<p>Ages Eligible for Study: <xsl:value-of select="minimum_age" /> To <xsl:value-of select="maximum_age" /></p> 
							<p>Genders Eligible for Study:  <xsl:value-of select="gender" /></p>
							<p>Accepts Healthy Volunteers: <xsl:value-of select="healthy_volunteers" /></p>
							<p>Sampling Method:  <xsl:value-of select="sampling_method" /></p>
							<p class="nctSubheading">Study Population: </p> <xsl:value-of select="study_pop/textblock" /> <br/>
							<p class="nctSubheading">Criteria: </p>
							<span><xsl:value-of select="criteria/textblock" /></span>
						</xsl:for-each>
					</div>
					end of eligibility section
					
					<!-- Contact section -->
					<div class="nctSection contactSection" id="Contact">
						<h3>Contacts and Locations</h3>
						<span>Choosing to participate in a study is an important personal decision. Talk with your doctor and family members or friends about deciding to join a study. To learn more about this study, you or your doctor may contact the study research staff using the Contacts provided below. 		For general information,  see 
							<a href="https://clinicaltrials.gov/ct2/about-studies/learn">Learn About Clinical Studies.</a><br/>
							Please refer to this study by its ClinicalTrials.gov identifier: <xsl:value-of select="id_info/nct_id" />
						</span>
						<span class="singleLineInfo">
							<p class="nctSubheading">Contacts</p>
							Contact: 
							<span><xsl:value-of select="overall_contact/last_name" /></span>
							<span><xsl:value-of select="overall_contact/phone" /></span>
							<span><a href="mailto:{overall_contact/last_name}"><xsl:value-of select="overall_contact/email" /></a></span>
						</span>
						<span class="clinicalLocations">
							<p class="nctSubheading">Locations</p>
							<xsl:for-each select="location">
								<p class="locationStatus"><xsl:value-of select="status" /></p>
								<p class="locationCity"><xsl:value-of select="facility/address/city" />, <xsl:value-of select="facility/address/country" /></p>
							</xsl:for-each>
						</span>
						<p class="nctSubheading">Sponsors and Collaborators</p>
						<xsl:for-each select="sponsors">
							<p><xsl:value-of select="lead_sponsor/agency" /></p>
						</xsl:for-each>
						<span class="singleLineInfo"> 
							<p class="nctSubheading">Investigators</p>
							<span><xsl:value-of select="overall_official/role" /></span>
							<span><xsl:value-of select="overall_official/last_name" /></span>
							<span><xsl:value-of select="overall_official/affiliation" /></span>
						</span>
					</div>
					<!-- end of contact section -->
					
					<!-- More Information section -->
					<div class="nctSection more_InfoSection">
						<h3>More Information</h3>
						<table>
							<tr>
								<td>Responsible Party: </td>
								<td>
									<xsl:value-of select="responsible_party/responsible_party_type" />
								</td>
							</tr>
							<tr>
								<td>ClinicalTrials.gov Identifier: </td>
								<td></td>
							</tr>
							<tr>
								<td>Other Study ID Numbers: </td>
								<td><xsl:value-of select="id_info/org_study_id" />, <xsl:value-of select="id_info/secondary_id" /></td>
							</tr>
							<tr>
								<td>Study First Received: </td>
								<td><xsl:value-of select="firstreceived_date" /></td>
							</tr>
							<tr>
								<td>Last Updated: </td>
								<td><xsl:value-of select="lastchanged_date" /></td>
							</tr>
							<tr>
								<td>Health Authority: </td>
								<td><xsl:value-of select="oversight_info/authority" /></td>
							</tr>
						</table>
						<xsl:if test="results_reference">
							<span class="results_reference">
								<xsl:copy-of select="results_reference" />
							</span>
						</xsl:if>
						<span class="clinicalKeywords">
							Keywords provided by <xsl:value-of select="source" />: <br/>
							<xsl:copy-of select="keyword" />
						</span>
					</div>


					<!-- mesh terms -->
		   
				      <!--  <br />
				     Additional relevant MeSH terms:
				     
				   <div class="indent3">       
				    <table width="100%" class="layout_table" border="0" cellspacing="0" cellpadding="0" summary="Layout table for MeSH terms">          
				     <thead>           
				      <tr>              
				       <th id="meshTermCol1" style="display: none;"></th>              
				       <th id="meshTermCol2" style="display: none;"></th>            
				      </tr>       
				     </thead>
				     <tbody>
				      <tr valign="top">
				       <td width="50%" headers="meshTermCol1">
				                <xsl:for-each select="condition_browse"> <br />
				                <xsl:value-of select="mesh_term" /><br />
				               </xsl:for-each>            
				       </td>                    
				      </tr>
				     </tbody>
				    </table>
				   </div> -->
				   
					<!--end of More Information section -->
				</xsl:for-each>

			</div> <!-- Purpose Section -->


        </div>
 
        <div id="tab2" class="clinical-tab">
            

        		<div id="TabularView_wrapper">
		<div id="TabularView_main-content">

			<div class="TabularView_indent1">
			   <br />
			<xsl:for-each select="clinical_study">
			 <table width="100%" class="data_table" cellspacing="3" cellpadding="5">
			  <tbody>
			   <tr>  
			    <th align="left" class="header2 banner_color" valign="middle" style="height: 3ex;" colspan="2">
			     Tracking Information
			    </th>
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     First Received Date <sup style="color: blue;"> ICMJE </sup> 
			    </th>       
			    <td class="body3" valign="top">
			     <xsl:value-of select="firstreceived_date" />
			    </td>      
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Last Updated Date 
			    </th>        
			    <td class="body3" valign="top">
			     <xsl:value-of select="lastchanged_date" />
			    </td>        
			   </tr>    
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Start Date <sup style="color: blue;"> ICMJE </sup> 
			    </th>       
			    <td class="body3" valign="top">
			     <xsl:value-of select="start_date" />
			    </td>      
			   </tr>   
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Estimated Primary Completion Date 
			    </th>      
			    <td class="body3" valign="top">
			     <xsl:value-of select="primary_completion_date" />  (final data collection date for primary outcome measure)
			    </td>       
			   </tr>     
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Current Primary Outcome Measures <sup style="color: blue;"> ICMJE </sup> <br /> <span class="footer">(submitted: <xsl:value-of select="firstreceived_date" />)</span>
			    </th>       
			    <td class="body3" valign="top">
			    	<ul style="margin:0ex 1em; padding:0ex 0em">
			    	<xsl:for-each select="primary_outcome">
					<li style="margin:1ex 0.5ex" class="color-bullet"><span class="li-content"><xsl:value-of select="measure" /> [ Time Frame: <xsl:value-of select="time_frame" /> ] [ Designated as safety issue: <xsl:value-of select="safety_issue" /> ]<div class="TabularView_indent2" style="margin-top:1ex;"><xsl:value-of select="description" /></div></span></li>
					</xsl:for-each>
					</ul>
				</td>     
			   </tr>  
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Original Primary Outcome Measures <sup style="color: blue;"> ICMJE </sup> 
			    </th>       
			    <td class="body3" valign="top">
			     <i style="color: #777777;">Same as current</i>
			    </td>      
			   </tr>      
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Change History 
			    </th>      
			    <td class="body3" valign="top">
			     <a target ="_blank" href="https://clinicaltrials.gov/ct2/archive/NCT02591277">Complete list of historical versions of study <xsl:value-of select="id_info/nct_id" />on ClinicalTrials.gov Archive Site</a>
			    </td>       
			   </tr>
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Current Secondary Outcome Measures <sup style="color: blue;"> ICMJE </sup> <br /> <span class="footer">(submitted: <xsl:value-of select="firstreceived_date" />)</span>
			    </th>       
			    <td class="body3" valign="top">
			     <ul style="padding-top: 0ex; padding-right: 0em; padding-bottom: 0ex; padding-left: 0em; margin-top: 0ex; margin-right: 1em; margin-bottom: 0ex; margin-left: 1em;"> 
			     <xsl:for-each select="secondary_outcome">	
			      <li style="margin-top: 1ex; margin-right: 0.5ex; margin-bottom: 1ex; margin-left: 0.5ex;">
			       <xsl:value-of select="measure" /> [ Time Frame: <xsl:value-of select="time_frame" /> ] [ Designated as safety issue: <xsl:value-of select="safety_issue" /> ]
			       <div class=" TabularView_indent2" style="margin-top: 1ex;">
			        <xsl:value-of select="description" />
			       </div>
			      </li>
				 </xsl:for-each>
			     </ul>
			    </td>      
			   </tr>     
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Original Secondary Outcome Measures <sup style="color: blue;"> ICMJE </sup> 
			    </th>        
			    <td class="body3" valign="top">
			     <i style="color: #777777;">Same as current</i>
			    </td>      
			   </tr>     
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Current Other Outcome Measures <sup style="color: blue;"> ICMJE </sup> 
			    </th>       
			    <td class="missing_color">
			     Not Provided
			    </td>       
			   </tr>    
			   <tr>    
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Original Other Outcome Measures <sup style="color: blue;"> ICMJE </sup> 
			    </th>        
			    <td class="missing_color">
			     Not Provided
			    </td>       
			   </tr>
			   <tr>
			    <td colspan="2">
			      
			    </td>
			   </tr>
			   <tr>   
			    <th align="left" class="header2 banner_color" valign="middle" style="height: 3ex;" colspan="2">
			     Descriptive Information
			    </th> 
			   </tr>     
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Brief Title <sup style="color: blue;"> ICMJE </sup> 
			    </th>        
			    <td class="body3" valign="top">
			     <xsl:value-of select="brief_title" />
			    </td>      
			   </tr>    
			   <tr>    
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Official Title <sup style="color: blue;"> ICMJE </sup> 
			    </th>        
			    <td class="body3" valign="top">
			     <xsl:value-of select="official_title" />
			    </td>      
			   </tr>   
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Brief Summary 
			    </th>         
			    <td class="body3" valign="top">
			     <xsl:value-of select="brief_summary/textblock" />
			    </td>      
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Detailed Description 
			    </th>
			    <xsl:if test="detailed_description/textblock">
			    <td class="body3" valign="top">
			     <xsl:value-of select="detailed_description/textblock" />
			    </td> 
			    </xsl:if>  
			    <xsl:if test="not(detailed_description/textblock)">       
			    <td class="missing_color">
			     Not Provided
			    </td>
			    </xsl:if>     
			   </tr>   
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Study Type <sup style="color: blue;"> ICMJE </sup> 
			    </th>      
			    <td class="body3" valign="top">
			     <xsl:value-of select="study_type" />
			    </td>     
			   </tr>    
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Study Design <sup style="color: blue;"> ICMJE </sup> 
			    </th>      
			    <td class="body3" valign="top">
			     <xsl:value-of select="study_design" />
			    </td>     
			   </tr> 
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Target Follow-Up Duration 
			    </th>    
			    <td class="missing_color">
			     Not Provided
			    </td>     
			   </tr>   
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Biospecimen 
			    </th>       
			    <td class="body3" valign="top">
			     Retention:   <xsl:value-of select="biospec_retention" />
			     <div style="margin-top: 0.5ex; margin-right: 0ex; margin-bottom: 0.5ex; margin-left: 0ex;">
			      Description: 
			     </div>
			     <div class=" TabularView_indent2">
			      <xsl:value-of select="biospec_descr/textblock" />
			     </div>
			    </td>    
			   </tr>  
			   <tr>
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Sampling Method 
			    </th>      
			    <td class="body3" valign="top">
			     <xsl:value-of select="sampling_method" />
			    </td>      
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Study Population 
			    </th>       
			    <td class="body3" valign="top">
			    <xsl:value-of select="eligibility/study_pop/textblock" />
			    </td>      
			   </tr>  
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Condition <sup style="color: blue;"> ICMJE </sup> 
			    </th>       
			    <td class="body3" valign="top">
			     <xsl:value-of select="condition" />
			    </td>     
			   </tr>   
			   <tr>
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Intervention <sup style="color: blue;"> ICMJE </sup> 
			    </th>     
			    <td class="body3" valign="top">
			    <xsl:for-each select="intervention">
			    	
			     <xsl:value-of select="intervention_type" />: <span class="hit_inf"><xsl:value-of select="intervention_name" /></span>
			     <div class=" TabularView_indent2" style="margin-top: 0.5ex;">
			      <xsl:value-of select="description" />
			     </div>
			     <div class=" TabularView_indent2" style="margin-top: 0.5ex;">
			      Other Names:
			      <ul style="margin-top: 0.5ex;">
			       <li>
			        <xsl:value-of select="other_name" />
			       </li>
			      </ul>
			     </div>
			 	</xsl:for-each>
			    </td>  
			   </tr> 
			   <tr>
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Study Group/Cohort (s) 
			    </th>    
			    <td class="body3" valign="top">
			    <xsl:for-each select="arm_group">	
			     <xsl:value-of select="arm_group_label" />
			     <div class=" TabularView_indent2" style="margin-top: 0.5ex;">
			      <xsl:value-of select="description" />
			     </div>
			    </xsl:for-each>
			     <div class=" TabularView_indent2" style="margin-top: 0.5ex;">
			     <xsl:for-each select="intervention">
			     Intervention:<xsl:value-of select="intervention_type" />: <xsl:value-of select="intervention_name" />
			 	</xsl:for-each>
			     </div>
			    </td>    
			   </tr>  
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Publications * 
			    </th>       
			    <td class="missing_color">
			     Not Provided
			    </td>     
			   </tr>
			   <tr>   
			    <td class="header3" style="padding-left: 2em;" colspan="2">
			             <br />
			             *   Includes publications given by the data provider as well as publications
			             identified by ClinicalTrials.gov Identifier (NCT Number) in Medline. 
			    </td>
			   </tr>
			   <tr>
			    <td colspan="2">
			      
			    </td>
			   </tr>
			   <tr>
			    <th align="left" class="header2 banner_color" valign="middle" style="height: 3ex;" colspan="2">
			     Recruitment Information
			    </th>
			   </tr>
			   <tr>
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Recruitment Status <sup style="color: blue;"> ICMJE </sup> 
			    </th>     
			    <td class="body3" valign="top">
			     <xsl:value-of select="overall_status" />
			    </td>    
			   </tr>  
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Estimated Enrollment <sup style="color: blue;"> ICMJE </sup> 
			    </th>      
			    <td class="body3" valign="top">
			     <xsl:value-of select="enrollment" />
			    </td>     
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Estimated Completion Date 
			    </th>        
			    <td class="body3" valign="top">
			     <xsl:value-of select="completion_date" />
			    </td>     
			   </tr>    
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Estimated Primary Completion Date 
			    </th>       
			    <td class="body3" valign="top">
			     <xsl:value-of select="primary_completion_date" />   (final data collection date for primary outcome measure)
			    </td>      
			   </tr>   
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Eligibility Criteria <sup style="color: blue;"> ICMJE </sup> 
			    </th>        
			    <td class="body3" valign="top">
			    <xsl:for-each select="eligibility">	
			     <xsl:value-of select="criteria/textblock" />
			    </xsl:for-each>
			    </td>     
			   </tr>  
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Gender 
			    </th>      
			    <td class="body3" valign="top">
			    <xsl:for-each select="eligibility">	
			     <xsl:value-of select="gender" />
			    </xsl:for-each>
			    </td>     
			   </tr>   
			   <tr>   
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Ages 
			    </th>       
			    <td class="missing_color">
			     Not Provided
			    </td>     
			   </tr>    
			   <tr>
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Accepts Healthy Volunteers 
			    </th>       
			    <td class="body3" valign="top">
			    <xsl:for-each select="eligibility">	
			     <xsl:value-of select="healthy_volunteers" />
			    </xsl:for-each>	
			    </td>     
			   </tr>    
			   <tr>
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Contacts <sup style="color: blue;"> ICMJE </sup> 
			    </th>  
			    <td class="body3" valign="top">
			     <a name="contacts">
			     <table class="layout_table" border="0" cellspacing="0" cellpadding="0">
			      <tbody>
			       <tr valign="top">
			        <td style="padding-left: 1em;">
			         Contact: <xsl:value-of select="overall_contact/last_name" />
			        </td>
			        <td style="padding-left: 1em;"></td>
			        <td style="padding-left: 1em;">
			         <a><xsl:value-of select="overall_contact/email" /></a>
			        </td>
			        <td style="padding-left: 1em;"></td>
			       </tr>
			      </tbody>
			     </table>
			     </a>
			    </td>      
			   </tr>  
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Listed Location Countries <sup style="color: blue;"> ICMJE </sup> 
			    </th>        
			    <td class="body3" valign="top">
			      	<xsl:value-of select="location_countries/country" />
			    </td>
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Removed Location Countries 
			    </th>    
			   </tr>
			   <tr>
			    <td colspan="2">
			      
			    </td>
			   </tr>
			   <tr>  
			    <th align="left" class="header2 banner_color" valign="middle" style="height: 3ex;" colspan="2">
			     Administrative Information
			    </th>
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     NCT Number <sup style="color: blue;"> ICMJE </sup> 
			    </th>       
			    <td class="body3" valign="top">
			     <xsl:value-of select="id_info/nct_id" />
			    </td>     
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Other Study ID Numbers <sup style="color: blue;"> ICMJE </sup> 
			    </th>       
			    <td class="body3" valign="top">
			     <xsl:value-of select="id_info/org_study_id" />
			    </td>     
			   </tr>   
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Has Data Monitoring Committee 
			    </th>       
			    <td class="body3" valign="top">
			     <xsl:value-of select="oversight_info/has_dmc" />
			    </td>     
			   </tr>   
			   <tr>  
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Responsible Party 
			    </th>       
			    <td class="body3" valign="top">
			     <xsl:value-of select="overall_official/affiliation" />
			    </td>     
			   </tr>   
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Study Sponsor <sup style="color: blue;"> ICMJE </sup> 
			    </th>        
			    <td class="body3" valign="top">
			     <xsl:for-each select="sponsors">
					<p><xsl:value-of select="lead_sponsor/agency" /></p>
				 </xsl:for-each>
			    </td>      
			   </tr>   
			   <tr> 
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Collaborators <sup style="color: blue;"> ICMJE </sup> 
			    </th>       
			    <td class="missing_color">
			     Not Provided
			    </td>     
			   </tr>
			   <tr>
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Investigators <sup style="color: blue;"> ICMJE </sup> 
			    </th>
			    <td class="body3" valign="top">
			     <table class="layout_table" border="0" cellspacing="0" cellpadding="0">
			      <tbody>
			       <tr valign="top"> 
			        <td style="padding-left: 1em;">
			         <xsl:value-of select="overall_official/role" />:
			        </td>
			        <td style="padding-left: 1em;">
			         <xsl:value-of select="overall_official/last_name" />
			        </td>
			        <td style="padding-left: 1em;">
			         <xsl:value-of select="overall_official/affiliation" />
			        </td>      
			        <td style="padding-left: 1em;"></td>
			       </tr>     
			      </tbody>
			     </table>    
			    </td>             
			   </tr>          
			   <tr>         
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Information Provided By 
			    </th>               
			    <td class="body3" valign="top">
			     <xsl:value-of select="source" />
			    </td>             
			   </tr>          
			   <tr>        
			    <th width="15%" align="left" class="header3 banner_color" valign="top">
			     Verification Date 
			    </th>             
			    <td class="body3" valign="top">
			     <xsl:value-of select="verification_date" />
			    </td>      
			   </tr>
			   <tr>
			    <td class="header3" style="padding-left: 2em;" colspan="2">
			             <br />
			             <sup style="color: blue;"> ICMJE </sup>    Data element required by the
			             <a href="http://www.icmje.org/recommendations/browse/publishing-and-editorial-issues/clinical-trial-registration.html">
			             International Committee of Medical Journal Editors</a> and the
			             <a href="http://www.who.int/ictrp/network/trds/en/index.html">World Health Organization ICTRP</a>          
			    </td>      
			   </tr>  
			  </tbody>
			 </table>
			 </xsl:for-each>
			   <br />
			</div>
		</div>
	</div>




        </div>

    </div>
</div>





















			  

    </div>
  </xsl:template>
</xsl:stylesheet>