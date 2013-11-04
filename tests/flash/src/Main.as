package 	
{
	import flash.display.StageAlign;
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.text.*;
	import flash.net.*;
	import flash.external.ExternalInterface;
	
	/**
	 * ...
	 * @author Andrey Shchekin
	 */
	public class Main extends Sprite 
	{
		private var button:Sprite;
		private var text:TextField;
		private var currentButtonColor:uint;
		
		public function Main():void 
		{			
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e:Event = null):void 
		{
			removeEventListener(Event.ADDED_TO_STAGE, init);
			stage.align = StageAlign.TOP_LEFT;
						
			button = new Sprite();			
			redrawButton(0xCCCCCC);
			
			button.useHandCursor = true;
			button.buttonMode = true;
			button.mouseChildren = false;
			
			button.addEventListener(MouseEvent.ROLL_OVER, buttonRollOver);
			button.addEventListener(MouseEvent.ROLL_OUT, buttonRollOut);
			button.addEventListener(MouseEvent.CLICK, buttonClick);
			
			text = new TextField();
			text.textColor = 0xFFFFFF;
			text.text = stage.loaderInfo.parameters["text"] || "Flash Button";
			resizeAndPositionText();			
			
			button.addChild(text);			
			this.addChild(button);
			
			stage.addEventListener(Event.RESIZE, stageResize);
			
			ExternalInterface.addCallback("flashClick", navigateOnClick);
		}
		
		private function stageResize(e:Event):void { 
			redrawButton(currentButtonColor);
			resizeAndPositionText();
		}
		
		private function resizeAndPositionText():void {
			var f:TextFormat = text.getTextFormat();

			var maxWidth:int = 0.9 * stage.stageWidth;
			var maxHeight:int = 0.9 * stage.stageHeight;
				
			while (text.textWidth < maxWidth && text.textHeight < maxHeight && f.size < 127) {
				f.size = int(f.size) + 1;
				text.setTextFormat(f);
			}
			
			while (text.textWidth > maxWidth || text.textHeight > maxHeight) {
				f.size = int(f.size) - 1;
				text.setTextFormat(f);
			}
			
			text.width = text.textWidth;
			text.height = text.textHeight;
			
			text.x = (stage.stageWidth / 2) - (text.width / 2);
			text.y = (stage.stageHeight / 2) - (text.height / 2);
		}
		
		private function buttonClick(event:MouseEvent):void
		{
			navigateOnClick();
		}
		
		private function buttonRollOver(event:MouseEvent):void
		{
			redrawButton(0xFFCC00);
		}
		
		private function buttonRollOut(event:MouseEvent):void
		{
			redrawButton(0xCCCCCC);
		}
		
		private function navigateOnClick():void {
			var request:URLRequest = new URLRequest(stage.loaderInfo.parameters["targetURL"]);
			request.method = URLRequestMethod.GET;
			navigateToURL(request, "_self");
		}
		
		private function redrawButton(color:uint):void
		{
			button.graphics.beginFill(color);
			button.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
			button.graphics.endFill();
			
			currentButtonColor = color;
		}
	}
	
}