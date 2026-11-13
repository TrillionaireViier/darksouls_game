// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

using UnrealBuildTool;

public class DarkSoulsGame : ModuleRules
{
	public DarkSoulsGame(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] { 
			"Core", 
			"CoreUObject", 
			"Engine", 
			"InputCore", 
			"UMG", 
			"Slate", 
			"SlateCore",
			"AIModule",
			"GameplayTasks"
		});

		PrivateDependencyModuleNames.AddRange(new string[] { });
	}
}
