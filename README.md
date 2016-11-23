# GroundTruth Web Page Segmentation Construction
## MOB - Manual Design Of Blocks

In order to help human assessors building a Web page segmentation (ground truth) we developped the tool MoB (Manual-design-Of-Blocks). 
It is designed as a browser extension and offers functionalities to expert users for creating a manual segmentations.
Users can create blocks based on Web page elements. They can merge blocks, navigate into the element hierarchy to produce a block graph, or produce a flat segmentation (i.e. leaves in the block tree). These segmentations are stored in arepository for the evaluation.

# Web Page Segmentation with Block-o-Matic (BoM)

Our segmenter BoM segments a Web page without having a priori knowledge of its content and using only the heuristic rules defined by the W3C Web standards. For instance, we detect blocks using HTML5 content categories instead of using the tag names or text features.
The segmentation process is composed of two main phases : detecting fine-grained (as small as possible) blocks and then merging them according to a stop condition, so that the segmentation is performed at the desired granularity. It can be expressed by the following function Φ(W), where W is the rendered DOM of a Web page.

# Links

Download MOB from <a href='http://www-poleia.lip6.fr/~sanojaa/BOM/MOB/MOB.crx'>Here</a>

For installing the extension follow the same process as the <a href='http://www-poleia.lip6.fr/~sanojaa/BOM/'>BOM extension</a> installation instructions

<a href='http://www-poleia.lip6.fr/~sanojaa/BOM/MOB/MOB-quickguide.pdf'>Download the Quick guide</a>

Dataset: <a href='http://www-poleia.lip6.fr/~sanojaa/BOM/inventory/dataset.tar.gz'>Web pages sources</a> (in <a href='https://addons.mozilla.org/en-US/firefox/addon/scrapbook/'>ScrapBook</a> firefox extension format)





