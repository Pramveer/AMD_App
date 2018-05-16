<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  version="1.0">
	<xsl:template match="/">
	<html>
		<body>
			<br />
			<div class="long-title">
				<span>
					<xsl:value-of select="document/component/structuredBody/component/section/subject/manufacturedProduct/manufacturedProduct/name" />
				</span>
				<span> (
					<xsl:value-of select="document/component/structuredBody/component/section/subject/manufacturedProduct/manufacturedProduct/asEntityWithGeneric/genericMedicine/name" />
				)</span>
			</div>
			<br />
            <xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'" />
            <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />
			<xsl:variable name="inconsistentdrugname" select="document/component/structuredBody/component/section/subject/manufacturedProduct/manufacturedProduct/name"></xsl:variable>
			<xsl:variable name="drugname" select="translate($inconsistentdrugname, $smallcase, $uppercase)" />
			<xsl:variable name="drugnameWithoutSpace" select="translate($drugname, ' ', '_')" />
            <xsl:for-each select="document/component/structuredBody/component">
			
					<div class="section">
						<xsl:if test="section/code/@code != '42230-3' and section/code/@code != '51945-4'">
							<xsl:if test="section/title">
								<div id="nonCollapsableElement_{section/code/@code}">
									
									<div class="drugSubheadings">
										<span id="{$drugnameWithoutSpace}_{section/code/@code}" class="drug-label-close" onclick="Template.Safety.toggle(this)"></span>
										<xsl:value-of select="section/title" />
									</div>
									<div id="{$drugnameWithoutSpace}_previewText_{section/code/@code}" class="previewText">
										<xsl:value-of select="substring(section/text, 1, 80)" />
										<xsl:variable name="text" select="section/excerpt/highlight/text"></xsl:variable>
										
											<xsl:value-of select="substring($text, 1, 80)" /><span>...</span>
									</div>
								</div>
							</xsl:if>	
							<div id="{$drugnameWithoutSpace}_collapsableElement_{section/code/@code}" style="margin-left:68px; margin-top: 20px;" class="collapseElement" >
								<div class="descriptionText">
									<xsl:copy-of select="section/text" />
									<xsl:copy-of select="section/excerpt/highlight/text" />
								</div>
								<xsl:for-each select="section/component">
                                    <!-- get the first 4 data of the title to make subsection id-->
                                    <xsl:variable name="sectionID" select="substring(section/title, 1, 4)" />
                                    <!-- replace the . with _ on the section title -->
                                    <xsl:variable name="repairedSectionID" select="translate($sectionID, '.', '_')" />
                                    <!--  trim the spaces from the ID -->
                                    <xsl:variable name="sectionIDWithoutSpace" select="normalize-space($repairedSectionID)" />
									<span id="{$drugnameWithoutSpace}_collapsableElement_{$sectionIDWithoutSpace}" class="safetySubheading">
										<xsl:value-of select="section/title" />
									</span>
									<div id="{section/code/@code}" class="safetySubdescription" >
										<xsl:copy-of select="section/text" />
										<xsl:copy-of select="section/excerpt/highlight/text" />
									</div>
									<xsl:for-each select="section/component">
											<span style="font-size : 15px; font-weight : bold;">
												<xsl:value-of select="section/title" />
											</span>
											<div>
												<xsl:copy-of select="section/text" />
												<xsl:copy-of select="section/excerpt/highlight/text" />
											</div>
									</xsl:for-each>
								</xsl:for-each>
							</div>
						</xsl:if>	
					</div>

			</xsl:for-each>
		</body>
	</html>
	</xsl:template>
</xsl:stylesheet>