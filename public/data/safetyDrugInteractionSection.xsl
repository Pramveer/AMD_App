<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  version="1.0">
	<xsl:template match="/">
	<html>
        <body>

            <xsl:variable name="drug" select="document/component/structuredBody/component/section/subject/manufacturedProduct/manufacturedProduct/name"></xsl:variable>

            <xsl:for-each select="document/component/structuredBody/component">
            <xsl:if test="section/code/@code = '34073-7'">
                    
                    <div class="safetyRiskDICIPopup">
                        <div><xsl:value-of select="section/excerpt/highlight/text" /></div>
                    </div> 

            </xsl:if>
			</xsl:for-each>
            <!--<a href='#' drug='{$drug}' section='#34073-7' class='btn btn-default btn-block lr-hr-moreInfo'><span class="lr-hr-moreInfoIcon"></span>full text</a>
            <span style='color:red;padding-right:5px;'>*</span><span style='display:inline-block; margin-top: 10px;color: #6e7579;'>Sourced from <a style="color: #ef4722;font-weight: 600;text-decoration: none;" href='http://dailymed.nlm.nih.gov/dailymed/'>http://dailymed.nlm.nih.gov</a></span>
        -->
        </body>
	</html>
	</xsl:template>
</xsl:stylesheet>