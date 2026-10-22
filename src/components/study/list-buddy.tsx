import { MeowBuddy } from "@/components/ui/meow-buddy";

/**
 * Casper keeps learners company on the list pages. On laptops he stays in the
 * bottom-right corner of the screen, beside the list, while you scroll. On
 * smaller screens the list fills the width, so he sits at the end of the page
 * instead of covering it. Clicking him gets a quick "meow".
 */
export function ListBuddy() {
  return (
    <div className="no-print pointer-events-none mt-6 flex justify-end lg:fixed lg:right-6 lg:bottom-6 lg:z-10 lg:mt-0 xl:right-10">
      <div className="w-24 sm:w-28 lg:w-32 xl:w-40">
        <MeowBuddy className="h-auto w-full drop-shadow-[4px_5px_0_rgb(173_77_102_/_0.32)]" />
      </div>
    </div>
  );
}
