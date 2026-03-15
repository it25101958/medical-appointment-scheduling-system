import Footer from "@/components/footer/footer";
import GridContainer from "@/components/grid-container";
import NavigationContainer from "@/components/navigation/navigation-container";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GridContainer className="">
        <NavigationContainer />
      </GridContainer>
      <GridContainer className="py-10">{children}</GridContainer>
      <GridContainer>
        <Footer />
      </GridContainer>
    </>
  );
}
