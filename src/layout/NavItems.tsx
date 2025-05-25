// NavItems.tsx
import { Flex, Text } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiListUnordered, RiMapPinLine, RiUser3Line, RiMusicLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";

interface NavItemsProps {
  direction: "row" | "column";
  iconSize?: number;
  fontSize?: string;
  textOnly?: boolean; // New prop to render text only (no icons)
}

const NavItems: React.FC<NavItemsProps> = ({
  direction,
  iconSize = 24,
  fontSize = "sm",
  textOnly = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkColor = (path: string) => {
    return location.pathname === path ? "purple.400" : "black";
  };

  const getLinkColorIcon = (path: string) => {
    return location.pathname === path ? "#9F7AEA" : "black";
  };

  return (
    <Flex direction={direction} justify="space-between" gap={direction === "row" ? 8 : 0}>
      {/* List Item */}
      <Flex
        flex={direction === "column" ? "1" : "none"}
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="2px"
        cursor="pointer"
        onClick={() => navigate("/")}
      >
        {!textOnly && <RiListUnordered color={getLinkColorIcon("/")} size={iconSize} />}
        <Text fontSize={fontSize} color={getLinkColor("/")} fontWeight={600} textAlign="center">
          {t("list")}
        </Text>
      </Flex>

      {/* Map Item */}
      <Flex
        flex={direction === "column" ? "1" : "none"}
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="2px"
        cursor="pointer"
        onClick={() => navigate("/map")}
      >
        {!textOnly && <RiMapPinLine color={getLinkColorIcon("/map")} size={iconSize} />}
        <Text fontSize={fontSize} color={getLinkColor("/map")} fontWeight={600} textAlign="center">
          {t("map")}
        </Text>
      </Flex>

      {/* Profile Item */}
      <Flex
        flex={direction === "column" ? "1" : "none"}
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="2px"
        cursor="pointer"
        onClick={() => navigate("/profile")}
      >
        {!textOnly && <RiUser3Line color={getLinkColorIcon("/profile")} size={iconSize} />}
        <Text fontSize={fontSize} color={getLinkColor("/profile")} fontWeight={600} textAlign="center">
          {t("profile")}
        </Text>
      </Flex>

      {/* Music Item */}
      <Flex
        flex={direction === "column" ? "1" : "none"}
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="2px"
        cursor="pointer"
        onClick={() => navigate("/music")}
      >
        {!textOnly && <RiMusicLine color={getLinkColorIcon("/music")} size={iconSize} />}
        <Text fontSize={fontSize} color={getLinkColor("/music")} fontWeight={600} textAlign="center">
          {t("music")}
        </Text>
      </Flex>
    </Flex>
  );
};

export default NavItems;