<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  version="1.0">
  <xsl:template match="/">
<html>
  <body>
  <div class="ClinicalTrialWrapper">    
  <table class="ClinicalTrialSearchResult data_table" style="width: 100%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-spacing: 0;">
   <tbody>
       <tr class="title-row">
       <th>Rank</th>
       <th>Status</th>
       <th style="text-align: left; padding-left: 1em;"> Study</th>
    </tr>
    <xsl:for-each select="search_results/study">
     <tr id="studyid_{@rank}" style="vertical-align: top;">
      <td style="text-align: center; padding-top: 2ex;"><xsl:value-of select="@rank" /></td>
      
      <xsl:if test="recruitment/@open != 'N'">
        <td style="text-align: center; padding-top: 2ex" ><span class="green"><xsl:value-of select="recruitment" /></span></td>
      </xsl:if>

      <xsl:if test="recruitment/@open != 'Y'">
        <td style="text-align: center; padding-top: 2ex;"><span class="red"><xsl:value-of select="recruitment" /></span></td>
      </xsl:if>
      <td style="text-align: center; padding-top: 2ex;">
       <span onclick="Template.ClinicalTrialsAPI.showStudyDetails('{url}')" class="titleSpan"><xsl:value-of select="title" /></span>
       <table class="data_table body3" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-spacing: 0;">
        <tr class="ineerTablerow" style="vertical-align: top;">
         <th class="body3" style="width: 12em; text-align: right;">Condition: </th>
         <td style="padding-left: 1em;"><xsl:value-of select="conditions/condition" /></td>
        </tr>
        <tr class="ineerTablerow" style="vertical-align: top;">
         <th class="body3" style="width: 12em; text-align: right;">Intervention: </th>
         <td style="padding-left: 1em;"><xsl:value-of select="interventions/intervention" /></td>
        </tr>
       </table>
      </td>
     </tr>
    </xsl:for-each>
   </tbody>  
  </table>
</div>
</body>
</html>
  
  </xsl:template>
</xsl:stylesheet>