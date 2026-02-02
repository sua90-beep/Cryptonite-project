
import { errorExtractor } from "error-extractor";
import iziToast, { IziToastSettings } from "izitoast";

class Notify {
       private settings: IziToastSettings= {

        position: "topLeft",
                timeout: 3000,
                transitionIn: "fadeInRight",
                transitionOut: "fadeOutLeft"
    };

    public success (message: string): void{
        this.settings.message=message;
        iziToast.success(this.settings);
    }

  public error(err:any): void{
        this.settings.message=errorExtractor.getMessage(err);
        iziToast.error(this.settings);
}
  public info(message: string): void{
        this.settings.message=message;
        iziToast.info(this.settings);
}
  public warning(message: string): void{
        this.settings.message=message;
        iziToast.warning(this.settings);
}
	
}

export const notify = new Notify();
